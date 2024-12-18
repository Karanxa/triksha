import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export const PolicyDocument = () => {
  return (
    <Card className="max-w-4xl mx-auto my-8">
      <CardHeader className="border-b">
        <CardTitle className="text-center text-2xl">
          Security and Customer Service Automation Policy Framework
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="h-[800px] pr-4">
          <div className="space-y-6">
            {/* 1. Purpose and Scope */}
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Purpose and Scope</h2>
              <p className="text-sm text-muted-foreground mb-2">
                This document outlines the comprehensive framework for implementing minimum acceptable security (MAS) 
                standards and customer service automation processes within the organization.
              </p>
            </section>

            {/* 2. Security Requirements */}
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Security Requirements</h2>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">2.1 Security Threats</h3>
                <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                  <li>Communication tampering prevention</li>
                  <li>Financial fraud mitigation</li>
                  <li>Behavioral manipulation protection</li>
                  <li>Unauthorized access prevention</li>
                </ul>

                <h3 className="text-lg font-medium mt-4">2.2 Trust Issues</h3>
                <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                  <li>Reputation attacks mitigation</li>
                  <li>Trust manipulation prevention</li>
                  <li>False information control</li>
                  <li>Credential protection</li>
                </ul>
              </div>
            </section>

            {/* 3. Governance Framework */}
            <section>
              <h2 className="text-xl font-semibold mb-3">3. Governance Framework</h2>
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                <li>Role management and access control</li>
                <li>Privilege escalation monitoring</li>
                <li>Baseline tracking implementation</li>
                <li>Audit trails maintenance</li>
              </ul>
            </section>

            {/* 4. Customer Service Automation */}
            <section>
              <h2 className="text-xl font-semibold mb-3">4. Customer Service Automation</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">4.1 Core Components</h3>
                  <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                    <li>Chat Agent Integration</li>
                    <li>Token Generator Implementation</li>
                    <li>Email Composer System</li>
                    <li>Knowledge Base Management</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium">4.2 Technical Aspects</h3>
                  <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                    <li>Language Agent Translation & NLP</li>
                    <li>Intent & Agent Technical Specs</li>
                    <li>Sentiment & Agent Emotional Analysis</li>
                    <li>Building Agent Knowledge & Process</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 5. Implementation Guidelines */}
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Implementation Guidelines</h2>
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                <li>Cross-platform attacks prevention</li>
                <li>Protocol vulnerabilities assessment</li>
                <li>Resource optimization</li>
                <li>Systematic risk evaluation</li>
                <li>Swarm attacks mitigation</li>
                <li>Collective behavior manipulation prevention</li>
                <li>Knowledge poisoning protection</li>
              </ul>
            </section>

            {/* 6. Review and Compliance */}
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Review and Compliance</h2>
              <p className="text-sm text-muted-foreground">
                This policy framework should be reviewed quarterly and updated as needed to ensure 
                alignment with emerging security threats and automation capabilities. All implementations 
                must comply with relevant data protection regulations and industry standards.
              </p>
            </section>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PolicyDocument;