import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { SpeechRecognitionService } from './speech-recognition.service';

describe('SpeechRecognitionService', () => {
  let service: SpeechRecognitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpeechRecognitionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('parseCommands', () => {
    describe('Strokes - Par/Bogey/Birdie/Eagle', () => {
      it('should parse "par on hole 5"', () => {
        const intents = service.parseCommands('par on hole 5');
        expect(intents).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'setStrokes',
              hole: 5,
              value: 0,
            }),
          ]),
        );
      });

      it('should parse "birdie 5"', () => {
        const intents = service.parseCommands('birdie 5');
        expect(intents).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'setStrokes',
              hole: 5,
              value: -1,
            }),
          ]),
        );
      });

      it('should parse "eagle on hole 3"', () => {
        const intents = service.parseCommands('eagle on hole 3');
        expect(intents).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'setStrokes',
              hole: 3,
              value: -2,
            }),
          ]),
        );
      });

      it('should parse "bogey hole 7"', () => {
        const intents = service.parseCommands('bogey hole 7');
        expect(intents).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'setStrokes',
              hole: 7,
              value: 1,
            }),
          ]),
        );
      });

      it('should parse "double bogey on hole 9"', () => {
        const intents = service.parseCommands('double bogey on hole 9');
        expect(intents).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'setStrokes',
              hole: 9,
              value: 2,
            }),
          ]),
        );
      });
    });

    describe('Putts', () => {
      it('should parse "2 putts"', () => {
        const intents = service.parseCommands('2 putts');
        expect(intents).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'setPutts',
              value: 2,
            }),
          ]),
        );
      });

      it('should parse "2 putts on hole 5"', () => {
        const intents = service.parseCommands('2 putts on hole 5');
        expect(intents).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'setPutts',
              hole: 5,
              value: 2,
            }),
          ]),
        );
      });

      it('should parse "hole 7 has 3 putts"', () => {
        const intents = service.parseCommands('hole 7 has 3 putts');
        expect(intents).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'setPutts',
              hole: 7,
              value: 3,
            }),
          ]),
        );
      });
    });

    describe('Stroke Plus/Minus One', () => {
      it('should parse "add one stroke on hole 5"', () => {
        const intents = service.parseCommands('add one stroke on hole 5');
        expect(intents).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'plusOneStroke',
              hole: 5,
            }),
          ]),
        );
      });

      it('should parse "minus one on hole 5"', () => {
        const intents = service.parseCommands('minus one on hole 5');
        expect(intents).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'minusOneStroke',
              hole: 5,
            }),
          ]),
        );
      });
    });

    describe('Save Command', () => {
      it('should parse "save"', () => {
        const intents = service.parseCommands('save');
        expect(intents).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'save',
            }),
          ]),
        );
      });

      it('should parse "done"', () => {
        const intents = service.parseCommands('done');
        expect(intents).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'save',
            }),
          ]),
        );
      });
    });

    describe('Multi-Intent Utterances', () => {
      it('should parse "par on hole 5, 2 putts"', () => {
        const intents = service.parseCommands('par on hole 5, 2 putts');
        expect(intents.length).toBe(2);
        expect(intents[0]).toEqual(
          expect.objectContaining({
            type: 'setStrokes',
            hole: 5,
            value: 0,
          }),
        );
        // When parsed as separate segments, "2 putts" loses hole context
        expect(intents[1]).toEqual(
          expect.objectContaining({
            type: 'setPutts',
            value: 2,
          }),
        );
      });

      it('should parse "bogey 9 then save"', () => {
        const intents = service.parseCommands('bogey 9 then save');
        expect(intents.length).toBe(2);
        expect(intents[0]?.type).toBe('setStrokes');
        expect(intents[1]?.type).toBe('save');
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty string', () => {
        const intents = service.parseCommands('');
        expect(intents.length).toBe(0);
      });

      it('should handle null', () => {
        const intents = service.parseCommands(null as any);
        expect(intents.length).toBe(0);
      });

      it('should handle undefined', () => {
        const intents = service.parseCommands(undefined as any);
        expect(intents.length).toBe(0);
      });

      it('should be case-insensitive', () => {
        const intents1 = service.parseCommands('PAR ON HOLE 5');
        const intents2 = service.parseCommands('par on hole 5');
        expect(intents1).toEqual(intents2);
      });

      it('should ignore unknown commands', () => {
        const intents = service.parseCommands(
          'foobar and par hole 5 and bazzle',
        );
        expect(intents.length).toBe(1);
        expect(intents[0]?.type).toBe('setStrokes');
      });

      it('should handle hole numbers 1-18', () => {
        for (let hole = 1; hole <= 18; hole++) {
          const intents = service.parseCommands(`par hole ${hole}`);
          expect(intents[0]?.hole).toBe(hole);
        }
      });
    });
  });

  describe('Browser Support', () => {
    it('should indicate browser support status', () => {
      expect(service.isBrowserSupported()).toBeDefined();
    });
  });

  describe('Listening State', () => {
    it('should expose isListening signal', () => {
      expect(service.isListening()).toBeDefined();
    });

    it('should expose transcript signal', () => {
      expect(service.transcript()).toBeDefined();
    });
  });
});
