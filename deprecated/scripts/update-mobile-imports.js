const fs = require('fs');
const path = require('path');

// Mobil dosyalarını shared-types kullanacak şekilde güncelle
const mobileDir = path.join(__dirname, 'packages/mobile/src');

function updateImports(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      updateImports(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let updated = false;
      
      // ./supabaseClient import'larını benalsam-shared-types ile değiştir
      if (content.includes("import { supabase } from './supabaseClient'")) {
        content = content.replace(
          "import { supabase } from './supabaseClient'",
          "import { supabase } from 'benalsam-shared-types'"
        );
        updated = true;
      }
      
      if (content.includes("import { supabase } from '../supabaseClient'")) {
        content = content.replace(
          "import { supabase } from '../supabaseClient'",
          "import { supabase } from 'benalsam-shared-types'"
        );
        updated = true;
      }
      
      if (content.includes("import { supabase } from '../../services/supabaseClient'")) {
        content = content.replace(
          "import { supabase } from '../../services/supabaseClient'",
          "import { supabase } from 'benalsam-shared-types'"
        );
        updated = true;
      }
      
      if (content.includes("import { supabase } from '../../../services/supabaseClient'")) {
        content = content.replace(
          "import { supabase } from '../../../services/supabaseClient'",
          "import { supabase } from 'benalsam-shared-types'"
        );
        updated = true;
      }
      
      if (updated) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated: ${filePath}`);
      }
    }
  });
}

console.log('🔄 Updating mobile imports to use shared-types...');
updateImports(mobileDir);
console.log('✅ Mobile imports updated!'); 