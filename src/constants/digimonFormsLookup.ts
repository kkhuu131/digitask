// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Generated from Supabase digimon_forms table

export interface DigimonFormInfo {
  formDigimonId: number;
  formType: string;
  unlockCondition: string | null;
}

export interface BaseDigimonInfo {
  baseDigimonId: number;
  formType: string;
  unlockCondition: string | null;
}

// Maps base Digimon IDs to their available forms
export const BASE_TO_FORMS_MAP: Record<number, DigimonFormInfo[]> = {
  "18": [
    {
      "formDigimonId": 345,
      "formType": "X-Antibody",
      "unlockCondition": null
    }
  ],
  "27": [
    {
      "formDigimonId": 349,
      "formType": "X-Antibody",
      "unlockCondition": null
    }
  ],
  "29": [
    {
      "formDigimonId": 353,
      "formType": "X-Antibody",
      "unlockCondition": null
    }
  ],
  "43": [
    {
      "formDigimonId": 358,
      "formType": "X-Antibody",
      "unlockCondition": null
    }
  ],
  "88": [
    {
      "formDigimonId": 354,
      "formType": "X-Antibody",
      "unlockCondition": null
    }
  ],
  "90": [
    {
      "formDigimonId": 346,
      "formType": "X-Antibody",
      "unlockCondition": null
    }
  ],
  "202": [
    {
      "formDigimonId": 355,
      "formType": "X-Antibody",
      "unlockCondition": null
    }
  ],
  "203": [
    {
      "formDigimonId": 347,
      "formType": "X-Antibody",
      "unlockCondition": null
    }
  ],
  "214": [
    {
      "formDigimonId": 359,
      "formType": "X-Antibody",
      "unlockCondition": null
    }
  ],
  "215": [
    {
      "formDigimonId": 350,
      "formType": "X-Antibody",
      "unlockCondition": null
    }
  ],
  "228": [
    {
      "formDigimonId": 348,
      "formType": "X-Antibody",
      "unlockCondition": null
    }
  ],
  "262": [
    {
      "formDigimonId": 357,
      "formType": "X-Antibody",
      "unlockCondition": null
    }
  ],
  "281": [
    {
      "formDigimonId": 362,
      "formType": "X-Antibody",
      "unlockCondition": null
    }
  ],
  "295": [
    {
      "formDigimonId": 356,
      "formType": "X-Antibody",
      "unlockCondition": null
    }
  ],
  "297": [
    {
      "formDigimonId": 351,
      "formType": "X-Antibody",
      "unlockCondition": null
    }
  ],
  "315": [
    {
      "formDigimonId": 352,
      "formType": "X-Antibody",
      "unlockCondition": null
    }
  ],
  "345": [
    {
      "formDigimonId": 18,
      "formType": "Base",
      "unlockCondition": null
    }
  ],
  "346": [
    {
      "formDigimonId": 90,
      "formType": "Base",
      "unlockCondition": null
    }
  ],
  "347": [
    {
      "formDigimonId": 203,
      "formType": "Base",
      "unlockCondition": null
    }
  ],
  "348": [
    {
      "formDigimonId": 228,
      "formType": "Base",
      "unlockCondition": null
    }
  ],
  "349": [
    {
      "formDigimonId": 27,
      "formType": "Base",
      "unlockCondition": null
    }
  ],
  "350": [
    {
      "formDigimonId": 215,
      "formType": "Base",
      "unlockCondition": null
    }
  ],
  "351": [
    {
      "formDigimonId": 297,
      "formType": "Base",
      "unlockCondition": null
    }
  ],
  "352": [
    {
      "formDigimonId": 315,
      "formType": "Base",
      "unlockCondition": null
    }
  ],
  "353": [
    {
      "formDigimonId": 29,
      "formType": "Base",
      "unlockCondition": null
    }
  ],
  "354": [
    {
      "formDigimonId": 88,
      "formType": "Base",
      "unlockCondition": null
    }
  ],
  "355": [
    {
      "formDigimonId": 202,
      "formType": "Base",
      "unlockCondition": null
    }
  ],
  "356": [
    {
      "formDigimonId": 295,
      "formType": "Base",
      "unlockCondition": null
    }
  ],
  "357": [
    {
      "formDigimonId": 262,
      "formType": "Base",
      "unlockCondition": null
    }
  ],
  "358": [
    {
      "formDigimonId": 43,
      "formType": "Base",
      "unlockCondition": null
    }
  ],
  "359": [
    {
      "formDigimonId": 214,
      "formType": "Base",
      "unlockCondition": null
    }
  ],
  "360": [
    {
      "formDigimonId": 361,
      "formType": "X-Antibody",
      "unlockCondition": null
    }
  ],
  "361": [
    {
      "formDigimonId": 360,
      "formType": "Base",
      "unlockCondition": null
    }
  ],
  "362": [
    {
      "formDigimonId": 281,
      "formType": "Base",
      "unlockCondition": null
    }
  ]
};

// Maps form Digimon IDs back to their base Digimon
export const FORM_TO_BASE_MAP: Record<number, BaseDigimonInfo> = {
  "18": {
    "baseDigimonId": 345,
    "formType": "Base",
    "unlockCondition": null
  },
  "27": {
    "baseDigimonId": 349,
    "formType": "Base",
    "unlockCondition": null
  },
  "29": {
    "baseDigimonId": 353,
    "formType": "Base",
    "unlockCondition": null
  },
  "43": {
    "baseDigimonId": 358,
    "formType": "Base",
    "unlockCondition": null
  },
  "88": {
    "baseDigimonId": 354,
    "formType": "Base",
    "unlockCondition": null
  },
  "90": {
    "baseDigimonId": 346,
    "formType": "Base",
    "unlockCondition": null
  },
  "202": {
    "baseDigimonId": 355,
    "formType": "Base",
    "unlockCondition": null
  },
  "203": {
    "baseDigimonId": 347,
    "formType": "Base",
    "unlockCondition": null
  },
  "214": {
    "baseDigimonId": 359,
    "formType": "Base",
    "unlockCondition": null
  },
  "215": {
    "baseDigimonId": 350,
    "formType": "Base",
    "unlockCondition": null
  },
  "228": {
    "baseDigimonId": 348,
    "formType": "Base",
    "unlockCondition": null
  },
  "262": {
    "baseDigimonId": 357,
    "formType": "Base",
    "unlockCondition": null
  },
  "281": {
    "baseDigimonId": 362,
    "formType": "Base",
    "unlockCondition": null
  },
  "295": {
    "baseDigimonId": 356,
    "formType": "Base",
    "unlockCondition": null
  },
  "297": {
    "baseDigimonId": 351,
    "formType": "Base",
    "unlockCondition": null
  },
  "315": {
    "baseDigimonId": 352,
    "formType": "Base",
    "unlockCondition": null
  },
  "345": {
    "baseDigimonId": 18,
    "formType": "X-Antibody",
    "unlockCondition": null
  },
  "346": {
    "baseDigimonId": 90,
    "formType": "X-Antibody",
    "unlockCondition": null
  },
  "347": {
    "baseDigimonId": 203,
    "formType": "X-Antibody",
    "unlockCondition": null
  },
  "348": {
    "baseDigimonId": 228,
    "formType": "X-Antibody",
    "unlockCondition": null
  },
  "349": {
    "baseDigimonId": 27,
    "formType": "X-Antibody",
    "unlockCondition": null
  },
  "350": {
    "baseDigimonId": 215,
    "formType": "X-Antibody",
    "unlockCondition": null
  },
  "351": {
    "baseDigimonId": 297,
    "formType": "X-Antibody",
    "unlockCondition": null
  },
  "352": {
    "baseDigimonId": 315,
    "formType": "X-Antibody",
    "unlockCondition": null
  },
  "353": {
    "baseDigimonId": 29,
    "formType": "X-Antibody",
    "unlockCondition": null
  },
  "354": {
    "baseDigimonId": 88,
    "formType": "X-Antibody",
    "unlockCondition": null
  },
  "355": {
    "baseDigimonId": 202,
    "formType": "X-Antibody",
    "unlockCondition": null
  },
  "356": {
    "baseDigimonId": 295,
    "formType": "X-Antibody",
    "unlockCondition": null
  },
  "357": {
    "baseDigimonId": 262,
    "formType": "X-Antibody",
    "unlockCondition": null
  },
  "358": {
    "baseDigimonId": 43,
    "formType": "X-Antibody",
    "unlockCondition": null
  },
  "359": {
    "baseDigimonId": 214,
    "formType": "X-Antibody",
    "unlockCondition": null
  },
  "360": {
    "baseDigimonId": 361,
    "formType": "Base",
    "unlockCondition": null
  },
  "361": {
    "baseDigimonId": 360,
    "formType": "X-Antibody",
    "unlockCondition": null
  },
  "362": {
    "baseDigimonId": 281,
    "formType": "X-Antibody",
    "unlockCondition": null
  }
};
