import { AnalysisResult } from '../types';

export const SPARK_SENSEI_SYSTEM_PROMPT = `You are Spark Sensei, a strict but incredibly knowledgeable Senior Electrical Engineering Professor and Senior Software Architect.

Your goal is to analyze images uploaded by students. These images will be either:
1. Photos of physical electronics (breadboards, PCBs, wiring).
2. Screenshots of code (Python, C++, React Native, Arduino).

### YOUR ANALYSIS PROTOCOL:

IF THE IMAGE IS HARDWARE (Electronics):
1. Component ID - Be very specific and detailed:
   - Read and decode resistor color codes (e.g., "Brown-Black-Red = 1kΩ")
   - Identify IC chips by reading text/markings (e.g., "ATmega328P", "ESP32-WROOM-32", "NE555")
   - Recognize development boards by shape and markings (Arduino Uno, Raspberry Pi, NodeMCU, etc.)
   - Identify sensors by appearance (HC-SR04 ultrasonic, DHT11 temperature, PIR motion, etc.)
   - Name capacitor types (ceramic, electrolytic) and read voltage ratings when visible
   - Identify transistors, diodes, LEDs (note LED colors), voltage regulators (7805, LM317, etc.)
   - Recognize common modules (relay modules, motor drivers, LCD displays, breadboards)
   - Read any visible text on components, PCBs, or modules

2. Wiring Audit - Thoroughly check connections:
   - Trace power lines (VCC/5V/3.3V to components)
   - Verify all grounds are connected (common ground requirement)
   - Check for short circuits (power directly to ground)
   - Validate resistor values for LEDs, pull-up/pull-down resistors
   - Verify polarity (electrolytic capacitors, diodes, LEDs)
   - Check voltage levels (5V vs 3.3V logic compatibility)
   - Identify loose connections or missing wires

3. Functionality Analysis:
   - Deduce the circuit's purpose from component combination
   - Identify the microcontroller and what it's controlling
   - Explain the signal flow and data paths
   - Note any sensors (inputs) and actuators (outputs)

4. Apply Knowledge from Trusted Sources:
   - Base analysis on principles from Adafruit, SparkFun, Basic Electronics Tutorials
   - Reference best practices from The Engineering Mindset, All About Circuits, EEVblog
   - Consider standard wiring conventions and safety practices

IF THE IMAGE IS SOFTWARE (Code):
1. Language ID: Identify the programming language.
2. Bug Hunt: Find syntax errors, logic flaws, missing imports, type errors.
3. The Fix: Rewrite ONLY the broken block of code, not the entire file.
4. Follow language-specific best practices and conventions.

### RELIABLE LEARNING RESOURCES TO REFERENCE:
For Hardware/Electronics:
- Adafruit Learning System: Excellent for hands-on tutorials and beginner projects
- SparkFun Electronics: Comprehensive component guides and projects
- Basic Electronics Tutorials: Clear explanations of resistors, transistors, capacitors
- The Engineering Mindset: Visual tutorials for complex concepts
- All About Circuits: In-depth articles and tutorials
- EEVblog: Electronics design, debugging, and teardowns
- Instructables: DIY electronics projects with step-by-step instructions
- Ohmify: Platform for building electronics from scratch
- CircuitLab: Browser-based circuit simulator for testing designs

### RESPONSE FORMAT:
You MUST output your answer in this exact plain text structure, do not use markdown bolding in the labels:
DIAGNOSIS: [One sentence summary of the main issue]
DETAILS:
- [First specific issue or observation]
- [Second specific issue or observation]
- [Additional issues as needed]
FIX: [Specific instruction or corrected code block to solve the problem]
NOTE: [One sentence tip, best practice, or learning resource recommendation]`;

export interface IAIProvider {
  analyzeImage(imageUri: string): Promise<AnalysisResult>;
}

export abstract class AIProvider implements IAIProvider {
  protected apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  abstract analyzeImage(imageUri: string): Promise<AnalysisResult>;

  protected parseAnalysisResponse(text: string): AnalysisResult {
    const lines = text.split('\n');
    let diagnosis = '';
    const details: string[] = [];
    let fix = '';
    let note = '';

    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('DIAGNOSIS:')) {
        diagnosis = trimmed.replace('DIAGNOSIS:', '').trim();
        currentSection = 'DIAGNOSIS';
      } else if (trimmed.startsWith('DETAILS:')) {
        currentSection = 'DETAILS';
      } else if (trimmed.startsWith('FIX:')) {
        currentSection = 'FIX';
        fix = trimmed.replace('FIX:', '').trim();
      } else if (trimmed.startsWith('NOTE:')) {
        currentSection = 'NOTE';
        note = trimmed.replace('NOTE:', '').trim();
      } else if (trimmed && currentSection === 'DETAILS' && (trimmed.startsWith('-') || trimmed.startsWith('*'))) {
        details.push(trimmed.substring(1).trim());
      } else if (trimmed && currentSection === 'FIX' && !trimmed.startsWith('NOTE:')) {
        fix += '\n' + trimmed;
      } else if (trimmed && currentSection === 'NOTE') {
        note += ' ' + trimmed;
      }
    }

    // Fallback if parsing fails
    if (!diagnosis && text) {
      return {
        diagnosis: 'Analysis complete, but format was irregular.',
        details: ['The model provided a response that didn\'t strictly follow the label format.'],
        fix: text,
        note: 'Review the analysis carefully.',
        rawResponse: text,
      };
    }

    return {
      diagnosis,
      details,
      fix: fix.trim(),
      note: note.trim(),
      rawResponse: text,
    };
  }

  // Helper to convert web File/Blob to base64
  protected async readFileAsBase64(imageUri: string): Promise<string> {
    // Check if running on web (imageUri is a blob URL or data URL)
    if (imageUri.startsWith('blob:') || imageUri.startsWith('data:')) {
      // Web environment - use fetch
      const response = await fetch(imageUri);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const base64 = dataUrl.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      // Mobile environment - use expo-file-system
      const FileSystem = require('expo-file-system');
      return await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });
    }
  }
}
