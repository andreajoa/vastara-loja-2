const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');

// Encontra o CLI do Hydrogen nos node_modules
const hydrogenCliPath = path.join(__dirname, 'node_modules/@shopify/cli/bin/hydrogen.js');

async function deploy() {
  console.log('Iniciando deploy...');

  try {
    // Executa o comando de deploy
    const {execSync: spawn} = require('child_process');
    const result = execSync('node', [hydrogenCliPath, 'deploy', '--force', '--metadata-description="Fix cart functionality"], {
      cwd: __dirname,
      env: { ...process.env }
    });

    console.log('Resultado:', result.stdout);
    console.error('Erros:', result.stderr);
    console.log('Exit code:', result.status);

    if (result.status !== 0) {
      console.error('Deploy falhou com código:', result.status);
      process.exit(result.status);
    }

  } catch (error) {
    console.error('Erro durante deploy:', error);
    process.exit(1);
  }
}

deploy();
