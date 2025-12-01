'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BrainCircuit, Bot, Search, Trash2 } from 'lucide-react';
import GraphVisualizer from './graph-visualizer';
import { learnAction, consultAction, getGraphAction, resetGraphAction } from '@/app/actions';
import type { GraphData } from '@/lib/graph-store';
import { Skeleton } from './ui/skeleton';

export default function GraphNexusApp() {
  const [isLearnPending, startLearnTransition] = useTransition();
  const [isConsultPending, startConsultTransition] = useTransition();
  const [isGraphPending, startGraphTransition] = useTransition();

  const [learnText, setLearnText] = useState('');
  const [consultQuery, setConsultQuery] = useState('');
  const [consultResponse, setConsultResponse] = useState('');
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const { toast } = useToast();

  const refreshGraph = () => {
    startGraphTransition(async () => {
      const result = await getGraphAction();
      if (result.data) {
        setGraphData(result.data);
      } else if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      }
    });
  };

  useEffect(() => {
    refreshGraph();
  }, []);

  const handleLearn = () => {
    startLearnTransition(async () => {
      const result = await learnAction(learnText);
      if (result.success) {
        toast({
          title: 'Knowledge Updated',
          description: result.success,
        });
        setLearnText('');
        refreshGraph();
      } else if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Learning Failed',
          description: result.error,
        });
      }
    });
  };

  const handleConsult = () => {
    setConsultResponse('');
    startConsultTransition(async () => {
      const result = await consultAction(consultQuery);
      if (result.response) {
        setConsultResponse(result.response);
      } else if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Consultation Failed',
          description: result.error,
        });
      }
    });
  };
  
  const handleReset = () => {
    startGraphTransition(async () => {
      const result = await resetGraphAction();
      if (result.success) {
        toast({
          title: 'Graph Reset',
          description: 'The knowledge graph has been cleared.',
        });
        setGraphData({ nodes: [], edges: [] });
        setConsultResponse('');
      } else if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Reset Failed',
          description: result.error,
        });
      }
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="flex items-center gap-4 mb-2">
            <BrainCircuit className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">GraphNexus</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          An AI-powered knowledge engine. Feed it text to build a dynamic knowledge graph, then consult it to get context-aware answers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <Card className="lg:col-span-3 h-[600px] flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Knowledge Graph</CardTitle>
                <CardDescription>Visual representation of the AI's memory.</CardDescription>
              </div>
              <Button variant="outline" size="icon" onClick={handleReset} disabled={isGraphPending || isLearnPending} aria-label="Reset Graph">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            {isGraphPending && graphData.nodes.length === 0 ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <GraphVisualizer nodes={graphData.nodes} edges={graphData.edges} />
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 h-full">
          <Tabs defaultValue="learn" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="learn">Learn</TabsTrigger>
              <TabsTrigger value="consult">Consult</TabsTrigger>
            </TabsList>
            <TabsContent value="learn">
              <Card>
                <CardHeader>
                  <CardTitle>Learn from Text</CardTitle>
                  <CardDescription>Provide text to extract knowledge and update the graph.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="e.g., The Eiffel Tower is in Paris. Paris is the capital of France."
                    className="min-h-[150px] resize-none font-code"
                    value={learnText}
                    onChange={(e) => setLearnText(e.target.value)}
                    disabled={isLearnPending}
                  />
                  <Button onClick={handleLearn} disabled={isLearnPending || !learnText.trim()} className="w-full">
                    {isLearnPending ? <Loader2 className="animate-spin" /> : 'Process & Learn'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="consult">
              <Card>
                <CardHeader>
                  <CardTitle>Consult the Nexus</CardTitle>
                  <CardDescription>Ask a question to get an AI-powered, context-aware response.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Where is the Eiffel Tower?"
                      value={consultQuery}
                      onChange={(e) => setConsultQuery(e.target.value)}
                      disabled={isConsultPending}
                      onKeyDown={(e) => e.key === 'Enter' && !isConsultPending && consultQuery.trim() && handleConsult()}
                    />
                    <Button onClick={handleConsult} disabled={isConsultPending || !consultQuery.trim()} size="icon" aria-label="Consult">
                      {isConsultPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                  { (isConsultPending || consultResponse) && (
                      <Card className="bg-secondary p-4 min-h-[150px]">
                        <CardContent className="pt-6">
                          {isConsultPending ? (
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Bot className="h-5 w-5 shrink-0"/>
                                <span>Thinking...</span>
                              </div>
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-4/5" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          ) : (
                            <p className="text-secondary-foreground whitespace-pre-wrap">{consultResponse}</p>
                          )}
                        </CardContent>
                      </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
