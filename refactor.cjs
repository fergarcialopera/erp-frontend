const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'src');

function mkdir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

mkdir(path.join(src, 'app'));
mkdir(path.join(src, 'app', 'providers'));
mkdir(path.join(src, 'features'));
mkdir(path.join(src, 'config'));
mkdir(path.join(src, 'components'));
mkdir(path.join(src, 'components', 'layouts'));
mkdir(path.join(src, 'lib'));

// Moves
function move(from, to) {
  const fromPath = path.join(src, from);
  const toPath = path.join(src, to);
  if (fs.existsSync(fromPath)) {
    fs.renameSync(fromPath, toPath);
    console.log(`Moved ${from} => ${to}`);
  }
}

move('contexts', 'app/providers');
move('layouts', 'components/layouts');
move('pages', 'app/routes');

console.log('Folders reorganized');
