import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { path: basePath } = req.query;

  if (!basePath || typeof basePath !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "path" query param.' });
  }

  try {
    const result = getFolderTree(basePath);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function getFolderTree(dirPath) {
  const stats = fs.statSync(dirPath);

  if (!stats.isDirectory()) {
    throw new Error(`${dirPath} is not a directory`);
  }

  const result = {
    name: path.basename(dirPath),
    path: dirPath,
    type: 'folder',
    children: [],
  };

  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const itemStats = fs.statSync(fullPath);

    if (itemStats.isDirectory()) {
      result.children.push(getFolderTree(fullPath));
    } else {
      result.children.push({
        name: item,
        path: fullPath,
        type: 'file',
      });
    }
  }

  return result;
}
