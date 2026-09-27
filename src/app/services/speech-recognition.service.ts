import { Injectable, signal } from '@angular/core';

/**
 * Represents a parsed speech command/intent
 */
export interface SpeechIntent {
  type:
    | 'setStrokes'
    | 'setScoreToPar'
    | 'setPutts'
    | 'setStrokeSequence'
    | 'setOpponentStrokes'
    | 'setOpponentScoreToPar'
    | 'setOpponentStrokeSequence'
    | 'plusOneStroke'
    | 'minusOneStroke';
  hole?: number;
  value?: number;
  values?: number[];
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
  public readonly permissionDenied = signal(false);

  private resultCallbacks: ((text: string) => void)[] = [];
  private errorCallbacks: ((error: string) => void)[] = [];
  private interimTranscript = '';
  private listeningRequested = false;
  private recognitionState: 'idle' | 'starting' | 'listening' | 'stopping' =
    'idle';
  private restartTimer?: ReturnType<typeof setTimeout>;

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

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = this.getBrowserLocale();
      return recognition;
    } catch {
      return null;
    }
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
      this.recognitionState = 'listening';
      this.permissionDenied.set(false);
      this.isListening.set(true);
      this.interimTranscript = '';
      this.transcript.set('');
      if (!this.listeningRequested) {
        this.stopListening();
      }
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          this.dispatchResult(transcript);
          this.transcript.set(transcript.trim());
        } else {
          // Interim result
          this.interimTranscript += transcript + ' ';
          this.transcript.set(this.interimTranscript);
        }
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech Recognition Error:', event.error);
      if (event.error === 'not-allowed') {
        this.permissionDenied.set(true);
      }
      this.errorCallbacks.forEach((callback) => callback(event.error));
      if (
        [
          'not-allowed',
          'service-not-allowed',
          'audio-capture',
          'network',
        ].includes(event.error)
      ) {
        this.listeningRequested = false;
      }
    };

    this.recognition.onend = () => {
      this.recognitionState = 'idle';
      this.isListening.set(false);
      this.interimTranscript = '';
      if (this.listeningRequested) {
        this.restartTimer = setTimeout(() => {
          this.restartTimer = undefined;
          if (this.listeningRequested && this.recognitionState === 'idle') {
            this.startListening();
          }
        });
      } else {
        this.transcript.set('');
      }
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

    this.listeningRequested = true;
    if (this.recognitionState !== 'idle') {
      return;
    }

    this.recognitionState = 'starting';
    try {
      this.recognition.start();
    } catch (error) {
      const name = (error as Error)?.name || 'unknown';
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        this.permissionDenied.set(true);
      }
      this.recognitionState = 'idle';
      this.listeningRequested = false;
      this.errorCallbacks.forEach((callback) => callback(name));
    }
  }

  /**
   * Stop listening for speech input
   */
  public stopListening(): void {
    this.listeningRequested = false;
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = undefined;
    }
    if (this.recognition && this.recognitionState !== 'idle') {
      this.recognitionState = 'stopping';
      try {
        this.recognition.stop();
      } catch {
        this.recognitionState = 'idle';
        this.isListening.set(false);
      }
    }
  }

  public clearPermissionDenied(): void {
    this.permissionDenied.set(false);
  }

  /**
   * Register a callback to be invoked when a final speech result is recognized
   */
  public onResult(callback: (text: string) => void): () => void {
    this.resultCallbacks.push(callback);
    return () => {
      this.resultCallbacks = this.resultCallbacks.filter(
        (registeredCallback) => registeredCallback !== callback,
      );
    };
  }

  public onError(callback: (error: string) => void): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter(
        (registeredCallback) => registeredCallback !== callback,
      );
    };
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
  public parseCommands(text: string, previousHole?: number): SpeechIntent[] {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const normalized = text
      .toLowerCase()
      .trim()
      .replace(/\bwhole\b/g, 'hole')
      .replace(
        /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\b/g,
        (word) =>
          String(
            [
              'zero',
              'one',
              'two',
              'three',
              'four',
              'five',
              'six',
              'seven',
              'eight',
              'nine',
              'ten',
              'eleven',
              'twelve',
              'thirteen',
              'fourteen',
              'fifteen',
              'sixteen',
              'seventeen',
              'eighteen',
              'nineteen',
              'twenty',
            ].indexOf(word),
          ),
      )
      .replace(/\b(\d{1,2})\s+(?:pets?|pots?)\b/g, '$1 putts');

    const opponentPrefixes = [
      "opponent's strokes ",
      "opponent's scores ",
      "opponent's stroke ",
      "opponent's score ",
      'opponent strokes ',
      'opponent scores ',
      'opponent stroke ',
      'opponent score ',
      'opponent ',
      "opponent's ",
    ];
    const opponentPrefix = opponentPrefixes.find((prefix) =>
      normalized.startsWith(prefix),
    );
    const sequenceText = opponentPrefix
      ? normalized.slice(opponentPrefix.length)
      : normalized;
    const sequenceValues = this.parseNumberSequence(sequenceText);
    if (sequenceValues) {
      if (sequenceValues.every((value) => value >= 1 && value <= 20)) {
        return [
          {
            type: opponentPrefix
              ? 'setOpponentStrokeSequence'
              : 'setStrokeSequence',
            values: sequenceValues,
            originalText: normalized,
          },
        ];
      }
      return [];
    }

    const segments = normalized
      .replace(/\b(?:and|then)\b/g, ',')
      .split(/[,.\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const intents: SpeechIntent[] = [];
    let currentHole = previousHole;

    for (const segment of segments) {
      const intent = this.parseSegment(segment, currentHole);
      if (intent) {
        intents.push(intent);
        if (intent.hole !== undefined) {
          currentHole = intent.hole;
        }
      }
    }

    return intents;
  }

  /**
   * Parse a single speech segment into an intent
   */
  private parseSegment(
    text: string,
    previousHole?: number,
  ): SpeechIntent | null {
    const scoreWords = [
      'double bogey',
      'double',
      'bogey',
      'birdie',
      'eagle',
      'par',
      'even',
      'level',
    ];
    const scoreValues: Record<string, number> = {
      'double bogey': 2,
      double: 2,
      bogey: 1,
      birdie: -1,
      eagle: -2,
      par: 0,
      even: 0,
      level: 0,
    };
    const opponentPrefix = ["opponent's ", 'opponent '].find((prefix) =>
      text.startsWith(prefix),
    );
    if (opponentPrefix) {
      const opponentScoreText = text.slice(opponentPrefix.length);
      const opponentScore = scoreWords.find(
        (word) =>
          opponentScoreText === word ||
          opponentScoreText.startsWith(`${word} `),
      );
      if (opponentScore) {
        const holeText = opponentScoreText.slice(opponentScore.length).trim();
        const holeMatch = holeText.match(/^(?:on )?(?:hole )?(\d{1,2})$/);
        if (holeMatch) {
          const hole = Number(holeMatch[1]);
          if (hole >= 1 && hole <= 18) {
            return {
              type: 'setOpponentScoreToPar',
              hole,
              value: scoreValues[opponentScore],
              originalText: text,
            };
          }
        }
      }
    }

    const opponentHoleFirst = text.match(
      /^opponent(?:'s)?(?:\s+strokes?)?\s+hole\s+(\d{1,2})\s+(?:is\s+|was\s+)?(\d{1,2})$/,
    );
    const opponentScoreFirst = text.match(
      /^opponent(?:'s)?(?:\s+strokes?)?\s+(\d{1,2})\s+on\s+(?:hole\s+)?(\d{1,2})$/,
    );
    if (opponentHoleFirst || opponentScoreFirst) {
      const rawValue = opponentHoleFirst?.[2] ?? opponentScoreFirst?.[1];
      if (rawValue === undefined) return null;
      const hole = Number(opponentHoleFirst?.[1] ?? opponentScoreFirst?.[2]);
      const value = Number(rawValue);
      if (hole < 1 || hole > 18 || value < 1 || value > 20) return null;
      return { type: 'setOpponentStrokes', hole, value, originalText: text };
    }

    const score = scoreWords.find(
      (word) => text === word || text.startsWith(`${word} `),
    );
    if (score) {
      const holeText = text.slice(score.length).trim();
      const holeMatch = holeText.match(/^(?:on )?(?:hole )?(\d{1,2})$/);
      const hole = holeMatch ? Number(holeMatch[1]) : previousHole;
      if (!hole || hole < 1 || hole > 18) return null;
      if (holeText && !holeMatch) return null;
      const value = scoreValues[score];
      return { type: 'setScoreToPar', hole, value, originalText: text };
    }

    const holePutts = text.match(
      /^hole\s+(\d{1,2})\s+(?:has\s+)?(\d{1,2})\s+putts?$/,
    );
    const putts =
      holePutts ??
      text.match(/^(\d{1,2})\s+putts?(?:\s+(?:on|for)\s+hole\s+(\d{1,2}))?$/);
    if (putts) {
      const value = Number(putts[holePutts ? 2 : 1]);
      let hole = previousHole;
      if (holePutts) {
        hole = Number(putts[1]);
      } else if (putts[2]) {
        hole = Number(putts[2]);
      }
      if (!hole || hole < 1 || hole > 18 || value > 15) return null;
      return { type: 'setPutts', hole, value, originalText: text };
    }

    const actualStrokes = text.match(
      /^hole\s+(\d{1,2})\s+(?:is\s+)?(\d{1,2})(?:\s+strokes?)?$/,
    );
    if (actualStrokes) {
      const hole = Number(actualStrokes[1]);
      const value = Number(actualStrokes[2]);
      if (hole < 1 || hole > 18 || value < 1 || value > 20) return null;
      return { type: 'setStrokes', hole, value, originalText: text };
    }

    const addStroke = text.match(
      /^(?:add|plus|increase)\s+(?:1\s+)?(?:stroke(?:s)?\s+)?(?:on\s+)?hole\s+(\d{1,2})$/,
    );
    if (addStroke) {
      const hole = Number(addStroke[1]);
      return hole <= 18
        ? { type: 'plusOneStroke', hole, originalText: text }
        : null;
    }

    const minusStroke = text.match(
      /^(?:minus|subtract|remove|decrease)\s+(?:1\s+)?(?:stroke(?:s)?\s+)?(?:on\s+)?hole\s+(\d{1,2})$/,
    );
    if (minusStroke) {
      const hole = Number(minusStroke[1]);
      return hole >= 1 && hole <= 18
        ? { type: 'minusOneStroke', hole, originalText: text }
        : null;
    }

    return null;
  }

  private parseNumberSequence(text: string): number[] | null {
    const parts = text.split(/[,;]/).map((part) => part.trim());
    if (parts.length < 2 || parts.length > 18) {
      return null;
    }
    if (parts.some((part) => !/^\d{1,2}$/.test(part))) {
      return null;
    }
    return parts.map(Number);
  }
}
