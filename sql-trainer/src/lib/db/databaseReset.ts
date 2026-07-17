// Reset / undo / restore controls exposed to the UI.
//   resetSandbox      — discard all sandbox changes, fresh copy of the dataset
//   undoLastChange    — revert the most recent mutating statement batch (single level)
//   restoreOriginal   — rebuild BOTH databases from the pristine file
import { db } from './database';

export async function resetSandbox(): Promise<void> {
  await db.reset('sandbox');
}

export async function undoLastChange(): Promise<void> {
  await db.undo();
}

export async function restoreOriginalDataset(): Promise<void> {
  await db.reset('learning');
  await db.reset('sandbox');
}
