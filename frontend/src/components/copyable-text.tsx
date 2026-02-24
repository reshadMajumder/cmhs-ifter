
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CopyableTextProps {
  text: string;
}

export function CopyableText({ text }: CopyableTextProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text).then(() => {
      setHasCopied(true);
      toast({
        description: `Copied "${text}" to clipboard.`,
      });
      setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: 'Could not copy text to clipboard.',
      });
    });
  };

  return (
    <div className="flex items-center gap-2 my-1">
      <span className="font-mono font-semibold text-bkash bg-bkash/10 px-2 py-1 rounded-md">
        {text}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={copyToClipboard}
      >
        {hasCopied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="sr-only">Copy {text}</span>
      </Button>
    </div>
  );
}
