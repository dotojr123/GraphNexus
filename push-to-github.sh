#!/bin/bash
echo "=== GraphNexus GitHub Push ==="
echo "Digite seu usuário GitHub: "
read GITHUB_USER
echo "Criando repositório remoto..."
git remote add origin https://github.com/$GITHUB_USER/GraphNexus.git
git branch -M main
echo "Fazendo push para GitHub..."
git push -u origin main
echo "✅ Pronto! Repositório criado em: https://github.com/$GITHUB_USER/GraphNexus"
