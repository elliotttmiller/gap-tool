const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const start = content.indexOf('function RiskReviewDrawer(');
const end = content.indexOf('function RemoveClientDrawer(');

const newBlock = `function RiskReviewDrawer({ client, mode = "generate" }: { client: ClientRecord; mode?: "generate" | "regenerate" }) {
  const navigate = useNavigate()
  const createScenario = useAppStore((state) => state.createScenario)
  const isRegenerate = mode === "regenerate"

  function handleClick() {
    const scenarioName = \`\${client.lastName} Household Risk Review\`
    const scenarioId = createScenario({ clientId: client.id, name: scenarioName, includedModules: advisorReferenceModules, activeModule: "life" })
    if (!scenarioId) return
    navigate(\`/scenarios/\${scenarioId}/life\`)
  }

  return isRegenerate ? (
    <button
      aria-label={\`Regenerate risk review for \${client.displayName}\`}
      title="Regenerate risk review"
      className="rounded-md p-1.5 text-blue-400 transition-colors hover:bg-blue-950/30 hover:text-blue-300"
      onClick={handleClick}
    >
      <RiRefreshLine className="size-4" aria-hidden="true" />
    </button>
  ) : (
    <Button variant="secondary" onClick={handleClick}>Generate Risk Review</Button>
  )
}

`;

content = content.slice(0, start) + newBlock + content.slice(end);
fs.writeFileSync('src/pages/Dashboard.tsx', content);
console.log('Done');
