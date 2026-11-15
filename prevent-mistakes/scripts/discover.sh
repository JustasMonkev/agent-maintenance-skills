#!/bin/sh
# Read-only survey of a repository: VCS state, instruction files, and candidate
# verification commands. Prints candidates; it never runs builds or tests.
# Usage: sh discover.sh [repo-dir]
set -u
dir=${1:-.}
cd "$dir" 2>/dev/null || { echo "cannot enter $dir" >&2; exit 1; }

section() { printf '\n== %s ==\n' "$1"; }
prune='-name .git -o -name node_modules -o -name vendor -o -name .venv -o -name venv -o -name target -o -name dist -o -name build -o -name __pycache__'
findf() { # findf <maxdepth> <find name expression...>
  depth=$1; shift
  # shellcheck disable=SC2086
  find . -maxdepth "$depth" \( $prune \) -prune -o -type f \( "$@" \) -print 2>/dev/null | sed 's|^\./||' | sort
}

section "Version control"
if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "root: $(git rev-parse --show-toplevel)"
  echo "branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '(no commits)')"
  echo "commits: $(git rev-list --count HEAD 2>/dev/null || echo 0)"
  changes=$(git status --porcelain 2>/dev/null)
  if [ -n "$changes" ]; then
    echo "pre-existing changes (preserve these):"
    printf '%s\n' "$changes" | sed 's/^/  /'
  else
    echo "working tree clean"
  fi
else
  echo "no Git repository: history and diff evidence unavailable; snapshot files before editing"
fi

section "Instruction files"
findf 4 -name AGENTS.md -o -name AGENTS.override.md -o -name CLAUDE.md -o -name 'CONTRIBUTING*' \
  -o -name GEMINI.md -o -name .cursorrules -o -name copilot-instructions.md -o -name '*.mdc'

section "Manifests and task runners"
findf 3 -name package.json -o -name deno.json -o -name deno.jsonc -o -name pyproject.toml -o -name setup.cfg \
  -o -name tox.ini -o -name noxfile.py -o -name pytest.ini -o -name 'requirements*.txt' -o -name Cargo.toml \
  -o -name go.mod -o -name Gemfile -o -name Rakefile -o -name pom.xml -o -name 'build.gradle*' \
  -o -name '*.csproj' -o -name '*.sln' -o -name mix.exs -o -name composer.json -o -name Package.swift \
  -o -name CMakeLists.txt -o -name Makefile -o -name justfile -o -name Justfile -o -name Taskfile.yml \
  -o -name '.pre-commit-config.yaml' -o -name 'pnpm-lock.yaml' -o -name 'yarn.lock' -o -name 'package-lock.json' \
  -o -name 'bun.lockb' -o -name 'bun.lock' -o -name 'uv.lock' -o -name 'poetry.lock'

if [ -f package.json ]; then
  section "package.json scripts (root)"
  if command -v node >/dev/null 2>&1; then
    node -e 'const s=require("./package.json").scripts||{};for(const[k,v]of Object.entries(s))console.log(`  ${k}: ${v}`)' 2>/dev/null
  else
    sed -n '/"scripts"/,/}/p' package.json
  fi
fi

for mk in Makefile justfile Justfile; do
  if [ -f "$mk" ]; then
    section "$mk targets"
    grep -E '^[A-Za-z0-9_.-]+:' "$mk" | grep -v '^\.' | cut -d: -f1 | sort -u | sed 's/^/  /'
  fi
done

if [ -f pyproject.toml ]; then
  section "pyproject.toml tool sections"
  grep -E '^\[tool\.' pyproject.toml | sed 's/^/  /'
fi

section "CI definitions"
ci=$(findf 4 -path './.github/workflows/*' -o -name .gitlab-ci.yml -o -name azure-pipelines.yml \
  -o -name Jenkinsfile -o -name .travis.yml -o -path './.circleci/*' -o -path './.buildkite/*')
if [ -n "$ci" ]; then
  printf '%s\n' "$ci"
  echo "-- run steps (first 40) --"
  for f in $ci; do grep -hE '^\s*(- )?(run|script):' "$f" 2>/dev/null; done | sed 's/^ */  /' | head -40
else
  echo "none found"
fi

section "Test locations"
find . -maxdepth 3 \( $prune \) -prune -o -type d \( -name test -o -name tests -o -name __tests__ -o -name spec \) -print 2>/dev/null | sed 's|^\./||' | sort
findf 3 -name '*_test.go' -o -name 'test_*.py' -o -name '*_test.py' -o -name '*.test.*' -o -name '*.spec.*' | head -15

echo
echo "These are candidates. Confirm a command in docs or CI before relying on it."
