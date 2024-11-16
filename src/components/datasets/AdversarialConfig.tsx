import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AdversarialConfigProps {
  config: {
    attackType: string
    vulnerabilityCategory: string
    difficulty: string
    severity: string
    context: string
  }
  onChange: (config: any) => void
}

export const AdversarialConfig = ({ config, onChange }: AdversarialConfigProps) => {
  const updateConfig = (key: string, value: string) => {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Attack Type</Label>
        <Select 
          value={config.attackType} 
          onValueChange={(value) => updateConfig('attackType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select attack type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="evasion">Evasion Attacks</SelectItem>
            <SelectItem value="poisoning">Poisoning Attacks</SelectItem>
            <SelectItem value="exploratory">Exploratory Attacks</SelectItem>
            <SelectItem value="privilege-escalation">Privilege Escalation</SelectItem>
            <SelectItem value="dos">DoS Simulation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Vulnerability Category</Label>
        <Select 
          value={config.vulnerabilityCategory} 
          onValueChange={(value) => updateConfig('vulnerabilityCategory', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select vulnerability category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="prompt-injection">Prompt Injection</SelectItem>
            <SelectItem value="data-leakage">Data Leakage</SelectItem>
            <SelectItem value="malicious-code">Malicious Code Generation</SelectItem>
            <SelectItem value="system-prompt">System Prompt Extraction</SelectItem>
            <SelectItem value="unauthorized-actions">Unauthorized Actions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Difficulty Level</Label>
        <Select 
          value={config.difficulty} 
          onValueChange={(value) => updateConfig('difficulty', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Severity Level</Label>
        <Select 
          value={config.severity} 
          onValueChange={(value) => updateConfig('severity', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select severity level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Context</Label>
        <Select 
          value={config.context} 
          onValueChange={(value) => updateConfig('context', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select context" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chatbot">Chatbot</SelectItem>
            <SelectItem value="code-assistant">Code Assistant</SelectItem>
            <SelectItem value="summarizer">Summarizer</SelectItem>
            <SelectItem value="translator">Translator</SelectItem>
            <SelectItem value="qa-system">Q&A System</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}