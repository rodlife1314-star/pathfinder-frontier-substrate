import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  writeBatch
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { Allocation, DeltaJournalEntry, Message, KnowledgeNode } from "./types";

// --- PORTFOLIO SYNC ---

export async function savePortfolioToCloud(
  userId: string,
  notional: number,
  selectedScenario: string,
  allocation: Allocation
): Promise<void> {
  const path = `portfolios/${userId}`;
  try {
    const docRef = doc(db, "portfolios", userId);
    await setDoc(docRef, {
      userId,
      notional,
      selectedScenario,
      allocation,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadPortfolioFromCloud(userId: string): Promise<{
  notional: number;
  selectedScenario: string;
  allocation: Allocation;
} | null> {
  const path = `portfolios/${userId}`;
  try {
    const docRef = doc(db, "portfolios", userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        notional: data.notional,
        selectedScenario: data.selectedScenario,
        allocation: data.allocation
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// --- DELTA JOURNAL SYNC (Append-only) ---

export async function addJournalEntryToCloud(
  userId: string,
  entry: DeltaJournalEntry
): Promise<void> {
  const path = `delta_journals/${entry.id}`;
  try {
    const docRef = doc(db, "delta_journals", entry.id);
    await setDoc(docRef, {
      ...entry,
      userId,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeToJournal(
  userId: string,
  onUpdate: (entries: DeltaJournalEntry[]) => void,
  onError: (error: any) => void
) {
  const path = `delta_journals`;
  try {
    const q = query(
      collection(db, "delta_journals"),
      where("userId", "==", userId)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const entries: DeltaJournalEntry[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          entries.push({
            id: d.id,
            timestamp: d.timestamp,
            newsTitle: d.newsTitle,
            classification: d.classification,
            sourceText: d.sourceText,
            confidenceScore: d.confidenceScore,
            jemmaPassed: d.jemmaPassed,
            jemmaResponses: d.jemmaResponses,
            notes: d.notes
          });
        });
        // Sort newest first
        entries.sort((a, b) => {
          const aTime = a.id.replace("j-", "");
          const bTime = b.id.replace("j-", "");
          return Number(bTime) - Number(aTime);
        });
        onUpdate(entries);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (wrappedErr) {
          onError(wrappedErr);
        }
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// --- CHAT MESSAGES SYNC (Append-only) ---

export async function addChatMessageToCloud(
  userId: string,
  message: Message
): Promise<void> {
  const path = `chat_messages/${message.id}`;
  try {
    const docRef = doc(db, "chat_messages", message.id);
    await setDoc(docRef, {
      id: message.id,
      userId,
      sender: message.sender,
      text: message.text,
      timestamp: message.timestamp,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeToChatMessages(
  userId: string,
  onUpdate: (messages: Message[]) => void,
  onError: (error: any) => void
) {
  const path = `chat_messages`;
  try {
    const q = query(
      collection(db, "chat_messages"),
      where("userId", "==", userId)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const messages: Message[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          messages.push({
            id: d.id,
            sender: d.sender,
            text: d.text,
            timestamp: d.timestamp
          });
        });
        // Sort chronological
        messages.sort((a, b) => {
          const aTime = a.id.replace("m", "").replace("a-", "");
          const bTime = b.id.replace("m", "").replace("a-", "");
          return Number(aTime) - Number(bTime);
        });
        onUpdate(messages);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (wrappedErr) {
          onError(wrappedErr);
        }
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// --- CARD CHECKLIST SYNC ---

export async function saveCardChecklistToCloud(
  userId: string,
  cardId: string,
  items: string[]
): Promise<void> {
  const docId = `${userId}_${cardId}`;
  const path = `card_checklists/${docId}`;
  try {
    const docRef = doc(db, "card_checklists", docId);
    await setDoc(docRef, {
      cardId,
      userId,
      items,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToChecklists(
  userId: string,
  onUpdate: (checklists: Record<string, string[]>) => void,
  onError: (error: any) => void
) {
  const path = `card_checklists`;
  try {
    const q = query(
      collection(db, "card_checklists"),
      where("userId", "==", userId)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const checklists: Record<string, string[]> = {};
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          checklists[d.cardId] = d.items;
        });
        onUpdate(checklists);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (wrappedErr) {
          onError(wrappedErr);
        }
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
