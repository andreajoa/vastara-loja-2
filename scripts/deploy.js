import {execSync} from 'child_process';
import path from 'path';
import {fileURLToPath} from 'url';

// Encontra o diretório do projeto
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function deploy() {
  console.log('🚀 Iniciando deploy para GitHub...');

  try {
    // Executa o comando de deploy usando npx
    const result = execSync('npx shopify hydrogen deploy --force', {
      cwd: __dirname,
      env: { ...process.env },
      stdio: 'inherit'
    });

    console.log('✅ Deploy concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante deploy:', error.message);
    if (error.status) {
      process.exit(error.status);
    }
    process.exit(1);
  }
}

deploy();
