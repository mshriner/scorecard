import { Injectable, signal } from '@angular/core';

/**
 * Represents a parsed speech command/intent
 */
export interface SpeechIntent {
  type:
    | 'setStrokes'
    | 'setPutts'
    | 'plusOneStroke'
    | 'minusOneStroke'
    | 'setCourse'
    | 'save'
    | 'unknown';
  hole?: number;
  value?: number;
  courseId?: string;
  originalText?: string;
}

/**
 * Service that wraps the Web Speech API and provides speech recognition functionality.
 * Exposes methods to start/stop listening and parse recognized text into structured intents.
 */
@Injectable({
  providedIn: 'root',
})
export class SpeechRecognitionService {
  private readonly recognition = this.initializeRecognition();
  public readonly isListening = signal(false);
  public readonly transcript = signal('');
  public readonly isBrowserSupported = signal(!!this.recognition);

  private resultCallbacks: ((text: string) => void)[] = [];
  private interimTranscript = '';

  constructor() {
    if (this.recognition) {
      this.setupRecognitionHandlers();
    }
  }

  /**
   * Initialize the Web Speech API recognition object
   */
  private initializeRecognition(): any | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = this.getBrowserLocale();
    return recognition;
  }

  /**
   * Get the browser's current locale for speech recognition
   */
  private getBrowserLocale(): string {
    return navigator.language || 'en-US';
  }

  /**
   * Setup event handlers for the recognition object
   */
  private setupRecognitionHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening.set(true);
      this.interimTranscript = '';
      this.transcript.set('');
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          // Final result - dispatch to callbacks
          this.dispatchResult(transcript);
          this.transcript.set('');
        } else {
          // Interim result
          this.interimTranscript += transcript + ' ';
          this.transcript.set(this.interimTranscript);
        }
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech Recognition Error:', event.error);
      this.transcript.set(`Error: ${event.error}`);
    };

    this.recognition.onend = () => {
      this.isListening.set(false);
      this.interimTranscript = '';
      this.transcript.set('');
    };
  }

  /**
   * Start listening for speech input
   */
  public startListening(): void {
    if (!this.recognition) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    if (!this.isListening()) {
      this.recognition.start();
    }
  }

  /**
   * Stop listening for speech input
   */
  public stopListening(): void {
    if (this.recognition && this.isListening()) {
      this.recognition.stop();
    }
  }

  /**
   * Register a callback to be invoked when a final speech result is recognized
   */
  public onResult(callback: (text: string) => void): void {
    this.resultCallbacks.push(callback);
  }

  /**
   * Dispatch recognized text to all registered callbacks
   */
  private dispatchResult(text: string): void {
    this.resultCallbacks.forEach((callback) => callback(text));
  }

  /**
   * Parse raw speech text into structured intents
   * Supports multiple commands separated by commas, periods, "and", or "then"
   */
  public parseCommands(text: string): SpeechIntent[] {
    if (!text || typeof text !== 'string') {
      return [];
    }

    // Normalize text
    const normalized = text.toLowerCase().trim();

    // Split by common delimiters and parse each segment
    const segments = normalized
      .split(/[,\.\n]|\s+and\s+|\s+then\s+/i)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const intents: SpeechIntent[] = [];

    for (const segment of segments) {
      const intent = this.parseSegment(segment);
      if (intent.type !== 'unknown') {
        intents.push(intent);
      }
    }

    return intents;
  }

  /**
   * Parse a single speech segment into an intent
   */
  private parseSegment(text: string): SpeechIntent {
    const intent: SpeechIntent = {
      type: 'unknown',
      originalText: text,
    };

    // Patterns for setting strokes (par, birdie, bogey, eagle, double bogey, etc.)
    const strokePatterns = [
      {
        pattern: /(?:par|white|level|even)(?:\s+on)?(?:\s+hole\s+)?(\d{1,2})?/i,
        getValue: () => 0,
      },
      {
        pattern: /(?:birdie)(?:\s+on)?(?:\s+hole\s+)?(\d{1,2})?/i,
        getValue: () => -1,
      },
      {
        pattern: /(?:eagle)(?:\s+on)?(?:\s+hole\s+)?(\d{1,2})?/i,
        getValue: () => -2,
      },
      {
        pattern:
          /(?:double\s+bogey|double)(?:\s+on)?(?:\s+hole\s+)?(\d{1,2})?/i,
        getValue: () => 2,
      },
      {
        pattern: /(?:bogey)(?:\s+on)?(?:\s+hole\s+)?(\d{1,2})?/i,
        getValue: () => 1,
      },
    ];

    // Try stroke patterns first
    for (const { pattern, getValue } of strokePatterns) {
      const match = text.match(pattern);
      if (match) {
        const holeNum = this.extractHoleNumber(text, match);
        if (holeNum !== null) {
          intent.type = 'setStrokes';
          intent.hole = holeNum;
          intent.value = getValue();
          return intent;
        }
      }
    }

    // Pattern: "(\d+) putts? (on hole (\d{1,2}))?" or "hole (\d{1,2}) (\d+) putts?"
    // Try "hole X has/has Y putts" pattern first
    const holeHasPuttsMatch = text.match(
      /hole\s+(\d{1,2})\s+(?:has\s+)?(\d+)\s+putts?/i,
    );
    if (holeHasPuttsMatch) {
      const holeNum = parseInt(holeHasPuttsMatch[1], 10);
      const puttsValue = parseInt(holeHasPuttsMatch[2], 10);
      intent.type = 'setPutts';
      intent.hole = holeNum;
      intent.value = puttsValue;
      return intent;
    }

    // Try "X putts on/for hole Y" or just "X putts" pattern
    const puttsMatch = text.match(
      /(\d+)\s+putts?(?:\s+on\s+hole\s+(\d{1,2}))?(?:\s+for\s+hole\s+(\d{1,2}))?/i,
    );

    if (puttsMatch) {
      const puttsValue = parseInt(puttsMatch[1], 10);
      let holeNum: number | null = puttsMatch[2]
        ? parseInt(puttsMatch[2], 10)
        : puttsMatch[3]
          ? parseInt(puttsMatch[3], 10)
          : null;

      // If no hole extracted from regex, try to find it in the text
      if (holeNum === null) {
        holeNum = this.extractHoleNumber(text);
      }

      // Allow putts without explicit hole number (for multi-intent parsing context)
      intent.type = 'setPutts';
      intent.value = puttsValue;
      if (holeNum !== null) {
        intent.hole = holeNum;
      }
      return intent;
    }

    // Pattern: "hole (\d+) (is )?(\d+)" -> set strokes to specific number
    const holeStrokesMatch = text.match(/hole\s+(\d{1,2})\s+(?:is\s+)?(\d+)/i);
    if (holeStrokesMatch) {
      const holeNum = parseInt(holeStrokesMatch[1], 10);
      const strokeValue = parseInt(holeStrokesMatch[2], 10);
      intent.type = 'setStrokes';
      intent.hole = holeNum;
      intent.value = strokeValue;
      return intent;
    }

    // Pattern: "add one stroke on hole X" or "plus one on hole X"
    const addStrokeMatch = text.match(
      /(?:add|plus|increase)\s+(?:one\s+)?stroke(?:s)?\s+(?:on\s+)?hole\s+(\d{1,2})/i,
    );
    if (addStrokeMatch) {
      intent.type = 'plusOneStroke';
      intent.hole = parseInt(addStrokeMatch[1], 10);
      return intent;
    }

    // Pattern: "minus one on hole X" or "subtract one stroke on hole X"
    const minusStrokeMatch = text.match(
      /(?:minus|subtract|remove|decrease)\s+(?:one\s+)?stroke(?:s)?\s+(?:on\s+)?hole\s+(\d{1,2})|(?:minus|subtract|remove|decrease)\s+(?:one\s+)?(?:on\s+)?hole\s+(\d{1,2})/i,
    );
    if (minusStrokeMatch) {
      const holeNum = minusStrokeMatch[1] || minusStrokeMatch[2];
      if (holeNum) {
        intent.type = 'minusOneStroke';
        intent.hole = parseInt(holeNum, 10);
        return intent;
      }
    }

    // Pattern: "save" or "save round"
    if (text.match(/(?:save|submit|done|finish|complete)(?:\s+round)?/i)) {
      intent.type = 'save';
      return intent;
    }

    return intent;
  }

  /**
   * Extract hole number from text
   * Looks for patterns like "hole 5" or just "5" if it's a standalone number
   */
  private extractHoleNumber(
    text: string,
    match?: RegExpMatchArray,
  ): number | null {
    // First, try to find "hole X" pattern in the full text
    const holeMatch = text.match(/hole\s+(\d{1,2})/i);
    if (holeMatch) {
      const num = parseInt(holeMatch[1], 10);
      if (num >= 1 && num <= 18) {
        return num;
      }
    }

    // If a match was provided, check its groups
    if (match && match.length > 1 && match[1]) {
      const num = parseInt(match[1], 10);
      if (num >= 1 && num <= 18) {
        return num;
      }
    }

    // Don't try to extract standalone numbers if they're part of putts/strokes
    // This prevents "2 putts" from being matched as hole 2
    if (text.match(/^\d+\s+putts?/i) || text.match(/^\d+\s+strokes?/i)) {
      return null;
    }

    // Look for standalone number that could be hole number
    const numberMatch = text.match(/\b(\d{1,2})\b/);
    if (numberMatch) {
      const num = parseInt(numberMatch[1], 10);
      if (num >= 1 && num <= 18) {
        return num;
      }
    }

    return null;
  }
}
