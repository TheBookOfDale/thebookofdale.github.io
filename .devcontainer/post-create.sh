#!/usr/bin/env bash
set -e

# If Node.js is needed, install based on .nvmrc if present
if [ -f .nvmrc ]; then
  bash -i -c "nvm install && nvm use"
elif [ -f package.json ]; then
  bash -i -c "nvm install --lts && nvm install-latest-npm"
fi

# Install npm dependencies if package.json exists
if [ -f package.json ]; then
  npm ci || npm install
  npm run build || true
fi

# Ensure Ruby gems are installed
bundle check || bundle install

# Install dependencies for shfmt extension
curl -sS https://webi.sh/shfmt | sh &>/dev/null

# Add OMZ plugins
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting
git clone https://github.com/zsh-users/zsh-autosuggestions ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions
sed -i -E "s/^(plugins=\()(git)(\))/\1\2 zsh-syntax-highlighting zsh-autosuggestions\3/" ~/.zshrc

# Avoid git log using less
echo -e "\nunset LESS" >>~/.zshrc