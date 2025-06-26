import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { MemoryBlockstore } from 'blockstore-core/memory';

let helia, fs;

export async function initIPFS() {
  helia = await createHelia({ blockstore: new MemoryBlockstore() });
  fs = unixfs(helia);
}

export async function uploadFile(file) {
  const buf = await file.arrayBuffer();
  const cid = await fs.addBytes(new Uint8Array(buf));
  return cid.toString();
}

export async function downloadFile(cid) {
  let content = [];
  for await (const chunk of fs.cat(cid)) {
    content.push(chunk);
  }
  return new Blob(content);
}
