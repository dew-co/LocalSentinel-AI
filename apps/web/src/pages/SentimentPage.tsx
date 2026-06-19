import SentimentAnalyzer from "../components/sentiment/SentimentAnalyzer";
import { PageContainer } from "../components/layout/PageContainer";
import { Activity } from "lucide-react";

export default function SentimentPage() {
  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Sentiment Radar</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
            <Activity size={14} className="text-cyan-400" /> 
            Analyze feedback, bug reports, and user urgency
          </p>
        </div>
      </div>
      
      <SentimentAnalyzer />
    </PageContainer>
  );
}

