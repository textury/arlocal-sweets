import { Tag } from "blockweave/dist/lib/tag";
import Transaction from "blockweave/dist/lib/transaction";
import { PTag } from "../faces/tags";

export const searchForTag = (tx: Transaction, name: string): string | null => {
  const tags: Tag[] = tx.get("tags") as string & Tag[];
  const pTags: PTag[] = tags.map((t) => ({
    name: t.get("name", { decode: true, string: true }),
    value: t.get("value", { decode: true, string: true }),
  }));

  const tag = pTags.find(($t) => $t.name === name);
  if (tag) {
    return tag.value;
  }
  return null;
};
