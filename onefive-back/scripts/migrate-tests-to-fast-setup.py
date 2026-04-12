#!/usr/bin/env python3
"""
Script pour migrer tous les tests E2E vers le nouveau système rapide.
"""

import os
import re
from pathlib import Path

def migrate_test_file(filepath: Path):
    """Migre un fichier de test vers fast-e2e-setup."""
    content = filepath.read_text()
    
    # Si déjà migré, ignorer
    if 'fast-e2e-setup' in content:
        return False
    
    # Remplacer les imports
    content = re.sub(
        r"import \{ setupE2E, E2EContext \} from ['\"].*e2e-setup['\"];",
        "import { setupFastE2E, FastE2EContext } from '../../test/utils/fast-e2e-setup';",
        content
    )
    
    # Remplacer les types E2EContext (mais pas dans les noms de fonctions)
    content = re.sub(r'\bE2EContext\b', 'FastE2EContext', content)
    
    # Remplacer setupE2E() mais pas dans les strings ou commentaires  
    content = re.sub(r'setupE2E\(\)', 'setupFastE2E()', content)
    
    # Remplacer teardown par cleanup dans les appels
    content = re.sub(
        r'await context\.teardown\(\);',
        'await context.cleanup();',
        content
    )
    
    filepath.write_text(content)
    return True

def main():
    # Trouver tous les fichiers .e2e-spec.ts
    project_root = Path(__file__).parent.parent
    test_files = list(project_root.glob('src/**/*.e2e-spec.ts'))
    
    migrated = 0
    for test_file in test_files:
        if migrate_test_file(test_file):
            print(f"✅ Migrated: {test_file.relative_to(project_root)}")
            migrated += 1
        else:
            print(f"⏭️  Skipped: {test_file.relative_to(project_root)}")
    
    print(f"\n🎉 Migration complete! {migrated}/{len(test_files)} files migrated.")
    print("\nNext steps:")
    print("1. Run: npm test -- --runInBand (first run to ensure it works)")
    print("2. Run: npm test (parallel, should be much faster!)")

if __name__ == '__main__':
    main()
