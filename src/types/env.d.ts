declare namespace NodeJS {
    interface ProcessEnv {
      URL_OPENAI: string;
      OPENAI_API_KEY: string;
      AUDIO_MP3_FILE_PATH: string;
      AUDIO_OGG_FILE_PATH: string;
      TWILIO_ACCOUNT_SID: string;
      TWILIO_AUTH_TOKEN: string;

    }
  }