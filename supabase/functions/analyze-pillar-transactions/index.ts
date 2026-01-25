import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// STATE SALES TAX CONFIGURATION
// ============================================================================

interface StateTaxConfig {
  general: number;        // General sales tax rate
  grocery: number;        // Grocery rate (0 = exempt)
  clothing: number;       // Clothing rate (0 = exempt in some states)
  prepared_food: number;  // Restaurant/dining rate (often higher)
  medical: number;        // Pharmacy/medical rate (usually exempt)
  digital: number;        // Digital services rate
}

// State tax rates with category-specific exemptions (combined state + avg local)
const STATE_TAX_RATES: Record<string, StateTaxConfig> = {
  'AL': { general: 0.0922, grocery: 0.0922, clothing: 0.0922, prepared_food: 0.0922, medical: 0, digital: 0.0922 },
  'AK': { general: 0.0176, grocery: 0, clothing: 0.0176, prepared_food: 0.0176, medical: 0, digital: 0.0176 },
  'AZ': { general: 0.0840, grocery: 0, clothing: 0.0840, prepared_food: 0.0840, medical: 0, digital: 0.0840 },
  'AR': { general: 0.0951, grocery: 0.015, clothing: 0.0951, prepared_food: 0.0951, medical: 0, digital: 0.0951 },
  'CA': { general: 0.0875, grocery: 0, clothing: 0.0875, prepared_food: 0.0875, medical: 0, digital: 0 },
  'CO': { general: 0.0777, grocery: 0, clothing: 0.0777, prepared_food: 0.0777, medical: 0, digital: 0.0777 },
  'CT': { general: 0.0635, grocery: 0, clothing: 0.0635, prepared_food: 0.0635, medical: 0, digital: 0.01 },
  'DE': { general: 0, grocery: 0, clothing: 0, prepared_food: 0, medical: 0, digital: 0 },
  'FL': { general: 0.0708, grocery: 0, clothing: 0.0708, prepared_food: 0.09, medical: 0, digital: 0.0708 },
  'GA': { general: 0.0735, grocery: 0, clothing: 0.0735, prepared_food: 0.0735, medical: 0, digital: 0.0735 },
  'HI': { general: 0.0444, grocery: 0.0444, clothing: 0.0444, prepared_food: 0.0444, medical: 0, digital: 0.0444 },
  'ID': { general: 0.0603, grocery: 0.0603, clothing: 0.0603, prepared_food: 0.0603, medical: 0, digital: 0.0603 },
  'IL': { general: 0.0882, grocery: 0.0225, clothing: 0.0882, prepared_food: 0.0882, medical: 0.01, digital: 0.0882 },
  'IN': { general: 0.0700, grocery: 0, clothing: 0.0700, prepared_food: 0.09, medical: 0, digital: 0.0700 },
  'IA': { general: 0.0694, grocery: 0, clothing: 0.0694, prepared_food: 0.0694, medical: 0, digital: 0.0694 },
  'KS': { general: 0.0869, grocery: 0.0869, clothing: 0.0869, prepared_food: 0.0869, medical: 0, digital: 0.0869 },
  'KY': { general: 0.0600, grocery: 0, clothing: 0.0600, prepared_food: 0.0600, medical: 0, digital: 0.0600 },
  'LA': { general: 0.0955, grocery: 0, clothing: 0.0955, prepared_food: 0.0955, medical: 0, digital: 0.0955 },
  'ME': { general: 0.0550, grocery: 0, clothing: 0.0550, prepared_food: 0.08, medical: 0, digital: 0.0550 },
  'MD': { general: 0.0600, grocery: 0, clothing: 0.0600, prepared_food: 0.0600, medical: 0, digital: 0.0600 },
  'MA': { general: 0.0625, grocery: 0, clothing: 0, prepared_food: 0.07, medical: 0, digital: 0.0625 },
  'MI': { general: 0.0600, grocery: 0, clothing: 0.0600, prepared_food: 0.0600, medical: 0, digital: 0.0600 },
  'MN': { general: 0.0749, grocery: 0, clothing: 0, prepared_food: 0.0749, medical: 0, digital: 0.0749 },
  'MS': { general: 0.0707, grocery: 0.0707, clothing: 0.0707, prepared_food: 0.0707, medical: 0, digital: 0.0707 },
  'MO': { general: 0.0825, grocery: 0.0125, clothing: 0.0825, prepared_food: 0.0825, medical: 0, digital: 0.0825 },
  'MT': { general: 0, grocery: 0, clothing: 0, prepared_food: 0, medical: 0, digital: 0 },
  'NE': { general: 0.0694, grocery: 0, clothing: 0.0694, prepared_food: 0.0694, medical: 0, digital: 0.0694 },
  'NV': { general: 0.0823, grocery: 0, clothing: 0.0823, prepared_food: 0.0823, medical: 0, digital: 0.0823 },
  'NH': { general: 0, grocery: 0, clothing: 0, prepared_food: 0.09, medical: 0, digital: 0 },
  'NJ': { general: 0.0663, grocery: 0, clothing: 0, prepared_food: 0.0663, medical: 0, digital: 0.0663 },
  'NM': { general: 0.0783, grocery: 0, clothing: 0.0783, prepared_food: 0.0783, medical: 0, digital: 0.0783 },
  'NY': { general: 0.0852, grocery: 0, clothing: 0, prepared_food: 0.0852, medical: 0, digital: 0.0852 },
  'NC': { general: 0.0698, grocery: 0.02, clothing: 0.0698, prepared_food: 0.0698, medical: 0, digital: 0.0698 },
  'ND': { general: 0.0696, grocery: 0, clothing: 0.0696, prepared_food: 0.0696, medical: 0, digital: 0.0696 },
  'OH': { general: 0.0723, grocery: 0, clothing: 0.0723, prepared_food: 0.0723, medical: 0, digital: 0.0723 },
  'OK': { general: 0.0895, grocery: 0.045, clothing: 0.0895, prepared_food: 0.0895, medical: 0, digital: 0.0895 },
  'OR': { general: 0, grocery: 0, clothing: 0, prepared_food: 0, medical: 0, digital: 0 },
  'PA': { general: 0.0634, grocery: 0, clothing: 0, prepared_food: 0.0634, medical: 0, digital: 0.0634 },
  'RI': { general: 0.0700, grocery: 0, clothing: 0, prepared_food: 0.08, medical: 0, digital: 0.0700 },
  'SC': { general: 0.0746, grocery: 0, clothing: 0.0746, prepared_food: 0.0746, medical: 0, digital: 0.0746 },
  'SD': { general: 0.0640, grocery: 0.0640, clothing: 0.0640, prepared_food: 0.0640, medical: 0, digital: 0.0640 },
  'TN': { general: 0.0955, grocery: 0.04, clothing: 0.0955, prepared_food: 0.0955, medical: 0, digital: 0.0955 },
  'TX': { general: 0.0825, grocery: 0, clothing: 0.0825, prepared_food: 0.0825, medical: 0, digital: 0.0825 },
  'UT': { general: 0.0719, grocery: 0.03, clothing: 0.0719, prepared_food: 0.0719, medical: 0, digital: 0.0719 },
  'VT': { general: 0.0624, grocery: 0, clothing: 0.0624, prepared_food: 0.09, medical: 0, digital: 0.0624 },
  'VA': { general: 0.0575, grocery: 0.025, clothing: 0.0575, prepared_food: 0.0575, medical: 0, digital: 0.0575 },
  'WA': { general: 0.0929, grocery: 0, clothing: 0.0929, prepared_food: 0.0929, medical: 0, digital: 0 },
  'WV': { general: 0.0651, grocery: 0, clothing: 0.0651, prepared_food: 0.0651, medical: 0, digital: 0.0651 },
  'WI': { general: 0.0543, grocery: 0, clothing: 0.0543, prepared_food: 0.0543, medical: 0, digital: 0.0543 },
  'WY': { general: 0.0536, grocery: 0, clothing: 0.0536, prepared_food: 0.0536, medical: 0, digital: 0.0536 },
};

// ZIP code prefix (3 digits) to state mapping
const ZIP_TO_STATE: Record<string, string> = {
  // Alabama (350-369)
  '350': 'AL', '351': 'AL', '352': 'AL', '353': 'AL', '354': 'AL', '355': 'AL', '356': 'AL', '357': 'AL', '358': 'AL', '359': 'AL',
  '360': 'AL', '361': 'AL', '362': 'AL', '363': 'AL', '364': 'AL', '365': 'AL', '366': 'AL', '367': 'AL', '368': 'AL', '369': 'AL',
  // Alaska (995-999)
  '995': 'AK', '996': 'AK', '997': 'AK', '998': 'AK', '999': 'AK',
  // Arizona (850-865)
  '850': 'AZ', '851': 'AZ', '852': 'AZ', '853': 'AZ', '854': 'AZ', '855': 'AZ', '856': 'AZ', '857': 'AZ', '858': 'AZ', '859': 'AZ',
  '860': 'AZ', '861': 'AZ', '862': 'AZ', '863': 'AZ', '864': 'AZ', '865': 'AZ',
  // Arkansas (716-729)
  '716': 'AR', '717': 'AR', '718': 'AR', '719': 'AR', '720': 'AR', '721': 'AR', '722': 'AR', '723': 'AR', '724': 'AR', '725': 'AR',
  '726': 'AR', '727': 'AR', '728': 'AR', '729': 'AR',
  // California (900-961)
  '900': 'CA', '901': 'CA', '902': 'CA', '903': 'CA', '904': 'CA', '905': 'CA', '906': 'CA', '907': 'CA', '908': 'CA', '909': 'CA',
  '910': 'CA', '911': 'CA', '912': 'CA', '913': 'CA', '914': 'CA', '915': 'CA', '916': 'CA', '917': 'CA', '918': 'CA', '919': 'CA',
  '920': 'CA', '921': 'CA', '922': 'CA', '923': 'CA', '924': 'CA', '925': 'CA', '926': 'CA', '927': 'CA', '928': 'CA', '930': 'CA',
  '931': 'CA', '932': 'CA', '933': 'CA', '934': 'CA', '935': 'CA', '936': 'CA', '937': 'CA', '938': 'CA', '939': 'CA', '940': 'CA',
  '941': 'CA', '942': 'CA', '943': 'CA', '944': 'CA', '945': 'CA', '946': 'CA', '947': 'CA', '948': 'CA', '949': 'CA', '950': 'CA',
  '951': 'CA', '952': 'CA', '953': 'CA', '954': 'CA', '955': 'CA', '956': 'CA', '957': 'CA', '958': 'CA', '959': 'CA', '960': 'CA', '961': 'CA',
  // Colorado (800-816)
  '800': 'CO', '801': 'CO', '802': 'CO', '803': 'CO', '804': 'CO', '805': 'CO', '806': 'CO', '807': 'CO', '808': 'CO', '809': 'CO',
  '810': 'CO', '811': 'CO', '812': 'CO', '813': 'CO', '814': 'CO', '815': 'CO', '816': 'CO',
  // Connecticut (060-069)
  '060': 'CT', '061': 'CT', '062': 'CT', '063': 'CT', '064': 'CT', '065': 'CT', '066': 'CT', '067': 'CT', '068': 'CT', '069': 'CT',
  // Delaware (197-199)
  '197': 'DE', '198': 'DE', '199': 'DE',
  // Florida (320-349)
  '320': 'FL', '321': 'FL', '322': 'FL', '323': 'FL', '324': 'FL', '325': 'FL', '326': 'FL', '327': 'FL', '328': 'FL', '329': 'FL',
  '330': 'FL', '331': 'FL', '332': 'FL', '333': 'FL', '334': 'FL', '335': 'FL', '336': 'FL', '337': 'FL', '338': 'FL', '339': 'FL',
  '340': 'FL', '341': 'FL', '342': 'FL', '344': 'FL', '346': 'FL', '347': 'FL', '349': 'FL',
  // Georgia (300-319, 398-399)
  '300': 'GA', '301': 'GA', '302': 'GA', '303': 'GA', '304': 'GA', '305': 'GA', '306': 'GA', '307': 'GA', '308': 'GA', '309': 'GA',
  '310': 'GA', '311': 'GA', '312': 'GA', '313': 'GA', '314': 'GA', '315': 'GA', '316': 'GA', '317': 'GA', '318': 'GA', '319': 'GA',
  '398': 'GA', '399': 'GA',
  // Hawaii (967-968)
  '967': 'HI', '968': 'HI',
  // Idaho (832-838)
  '832': 'ID', '833': 'ID', '834': 'ID', '835': 'ID', '836': 'ID', '837': 'ID', '838': 'ID',
  // Illinois (600-629)
  '600': 'IL', '601': 'IL', '602': 'IL', '603': 'IL', '604': 'IL', '605': 'IL', '606': 'IL', '607': 'IL', '608': 'IL', '609': 'IL',
  '610': 'IL', '611': 'IL', '612': 'IL', '613': 'IL', '614': 'IL', '615': 'IL', '616': 'IL', '617': 'IL', '618': 'IL', '619': 'IL',
  '620': 'IL', '621': 'IL', '622': 'IL', '623': 'IL', '624': 'IL', '625': 'IL', '626': 'IL', '627': 'IL', '628': 'IL', '629': 'IL',
  // Indiana (460-479)
  '460': 'IN', '461': 'IN', '462': 'IN', '463': 'IN', '464': 'IN', '465': 'IN', '466': 'IN', '467': 'IN', '468': 'IN', '469': 'IN',
  '470': 'IN', '471': 'IN', '472': 'IN', '473': 'IN', '474': 'IN', '475': 'IN', '476': 'IN', '477': 'IN', '478': 'IN', '479': 'IN',
  // Iowa (500-528)
  '500': 'IA', '501': 'IA', '502': 'IA', '503': 'IA', '504': 'IA', '505': 'IA', '506': 'IA', '507': 'IA', '508': 'IA', '509': 'IA',
  '510': 'IA', '511': 'IA', '512': 'IA', '513': 'IA', '514': 'IA', '515': 'IA', '516': 'IA', '520': 'IA', '521': 'IA', '522': 'IA',
  '523': 'IA', '524': 'IA', '525': 'IA', '526': 'IA', '527': 'IA', '528': 'IA',
  // Kansas (660-679)
  '660': 'KS', '661': 'KS', '662': 'KS', '664': 'KS', '665': 'KS', '666': 'KS', '667': 'KS', '668': 'KS', '669': 'KS',
  '670': 'KS', '671': 'KS', '672': 'KS', '673': 'KS', '674': 'KS', '675': 'KS', '676': 'KS', '677': 'KS', '678': 'KS', '679': 'KS',
  // Kentucky (400-427)
  '400': 'KY', '401': 'KY', '402': 'KY', '403': 'KY', '404': 'KY', '405': 'KY', '406': 'KY', '407': 'KY', '408': 'KY', '409': 'KY',
  '410': 'KY', '411': 'KY', '412': 'KY', '413': 'KY', '414': 'KY', '415': 'KY', '416': 'KY', '417': 'KY', '418': 'KY', '420': 'KY',
  '421': 'KY', '422': 'KY', '423': 'KY', '424': 'KY', '425': 'KY', '426': 'KY', '427': 'KY',
  // Louisiana (700-714)
  '700': 'LA', '701': 'LA', '703': 'LA', '704': 'LA', '705': 'LA', '706': 'LA', '707': 'LA', '708': 'LA',
  '710': 'LA', '711': 'LA', '712': 'LA', '713': 'LA', '714': 'LA',
  // Maine (039-049)
  '039': 'ME', '040': 'ME', '041': 'ME', '042': 'ME', '043': 'ME', '044': 'ME', '045': 'ME', '046': 'ME', '047': 'ME', '048': 'ME', '049': 'ME',
  // Maryland (206-219)
  '206': 'MD', '207': 'MD', '208': 'MD', '209': 'MD', '210': 'MD', '211': 'MD', '212': 'MD', '214': 'MD', '215': 'MD', '216': 'MD',
  '217': 'MD', '218': 'MD', '219': 'MD',
  // Massachusetts (010-027)
  '010': 'MA', '011': 'MA', '012': 'MA', '013': 'MA', '014': 'MA', '015': 'MA', '016': 'MA', '017': 'MA', '018': 'MA', '019': 'MA',
  '020': 'MA', '021': 'MA', '022': 'MA', '023': 'MA', '024': 'MA', '025': 'MA', '026': 'MA', '027': 'MA',
  // Michigan (480-499)
  '480': 'MI', '481': 'MI', '482': 'MI', '483': 'MI', '484': 'MI', '485': 'MI', '486': 'MI', '487': 'MI', '488': 'MI', '489': 'MI',
  '490': 'MI', '491': 'MI', '492': 'MI', '493': 'MI', '494': 'MI', '495': 'MI', '496': 'MI', '497': 'MI', '498': 'MI', '499': 'MI',
  // Minnesota (550-567)
  '550': 'MN', '551': 'MN', '553': 'MN', '554': 'MN', '555': 'MN', '556': 'MN', '557': 'MN', '558': 'MN', '559': 'MN',
  '560': 'MN', '561': 'MN', '562': 'MN', '563': 'MN', '564': 'MN', '565': 'MN', '566': 'MN', '567': 'MN',
  // Mississippi (386-397)
  '386': 'MS', '387': 'MS', '388': 'MS', '389': 'MS', '390': 'MS', '391': 'MS', '392': 'MS', '393': 'MS', '394': 'MS', '395': 'MS', '396': 'MS', '397': 'MS',
  // Missouri (630-658)
  '630': 'MO', '631': 'MO', '633': 'MO', '634': 'MO', '635': 'MO', '636': 'MO', '637': 'MO', '638': 'MO', '639': 'MO',
  '640': 'MO', '641': 'MO', '644': 'MO', '645': 'MO', '646': 'MO', '647': 'MO', '648': 'MO', '649': 'MO',
  '650': 'MO', '651': 'MO', '652': 'MO', '653': 'MO', '654': 'MO', '655': 'MO', '656': 'MO', '657': 'MO', '658': 'MO',
  // Montana (590-599)
  '590': 'MT', '591': 'MT', '592': 'MT', '593': 'MT', '594': 'MT', '595': 'MT', '596': 'MT', '597': 'MT', '598': 'MT', '599': 'MT',
  // Nebraska (680-693)
  '680': 'NE', '681': 'NE', '683': 'NE', '684': 'NE', '685': 'NE', '686': 'NE', '687': 'NE', '688': 'NE', '689': 'NE',
  '690': 'NE', '691': 'NE', '692': 'NE', '693': 'NE',
  // Nevada (889-898)
  '889': 'NV', '890': 'NV', '891': 'NV', '893': 'NV', '894': 'NV', '895': 'NV', '897': 'NV', '898': 'NV',
  // New Hampshire (030-038)
  '030': 'NH', '031': 'NH', '032': 'NH', '033': 'NH', '034': 'NH', '035': 'NH', '036': 'NH', '037': 'NH', '038': 'NH',
  // New Jersey (070-089)
  '070': 'NJ', '071': 'NJ', '072': 'NJ', '073': 'NJ', '074': 'NJ', '075': 'NJ', '076': 'NJ', '077': 'NJ', '078': 'NJ', '079': 'NJ',
  '080': 'NJ', '081': 'NJ', '082': 'NJ', '083': 'NJ', '084': 'NJ', '085': 'NJ', '086': 'NJ', '087': 'NJ', '088': 'NJ', '089': 'NJ',
  // New Mexico (870-884)
  '870': 'NM', '871': 'NM', '872': 'NM', '873': 'NM', '874': 'NM', '875': 'NM', '877': 'NM', '878': 'NM', '879': 'NM',
  '880': 'NM', '881': 'NM', '882': 'NM', '883': 'NM', '884': 'NM',
  // New York (100-149)
  '100': 'NY', '101': 'NY', '102': 'NY', '103': 'NY', '104': 'NY', '105': 'NY', '106': 'NY', '107': 'NY', '108': 'NY', '109': 'NY',
  '110': 'NY', '111': 'NY', '112': 'NY', '113': 'NY', '114': 'NY', '115': 'NY', '116': 'NY', '117': 'NY', '118': 'NY', '119': 'NY',
  '120': 'NY', '121': 'NY', '122': 'NY', '123': 'NY', '124': 'NY', '125': 'NY', '126': 'NY', '127': 'NY', '128': 'NY', '129': 'NY',
  '130': 'NY', '131': 'NY', '132': 'NY', '133': 'NY', '134': 'NY', '135': 'NY', '136': 'NY', '137': 'NY', '138': 'NY', '139': 'NY',
  '140': 'NY', '141': 'NY', '142': 'NY', '143': 'NY', '144': 'NY', '145': 'NY', '146': 'NY', '147': 'NY', '148': 'NY', '149': 'NY',
  // North Carolina (270-289)
  '270': 'NC', '271': 'NC', '272': 'NC', '273': 'NC', '274': 'NC', '275': 'NC', '276': 'NC', '277': 'NC', '278': 'NC', '279': 'NC',
  '280': 'NC', '281': 'NC', '282': 'NC', '283': 'NC', '284': 'NC', '285': 'NC', '286': 'NC', '287': 'NC', '288': 'NC', '289': 'NC',
  // North Dakota (580-588)
  '580': 'ND', '581': 'ND', '582': 'ND', '583': 'ND', '584': 'ND', '585': 'ND', '586': 'ND', '587': 'ND', '588': 'ND',
  // Ohio (430-459)
  '430': 'OH', '431': 'OH', '432': 'OH', '433': 'OH', '434': 'OH', '435': 'OH', '436': 'OH', '437': 'OH', '438': 'OH', '439': 'OH',
  '440': 'OH', '441': 'OH', '442': 'OH', '443': 'OH', '444': 'OH', '445': 'OH', '446': 'OH', '447': 'OH', '448': 'OH', '449': 'OH',
  '450': 'OH', '451': 'OH', '452': 'OH', '453': 'OH', '454': 'OH', '455': 'OH', '456': 'OH', '457': 'OH', '458': 'OH', '459': 'OH',
  // Oklahoma (730-749)
  '730': 'OK', '731': 'OK', '734': 'OK', '735': 'OK', '736': 'OK', '737': 'OK', '738': 'OK', '739': 'OK',
  '740': 'OK', '741': 'OK', '743': 'OK', '744': 'OK', '745': 'OK', '746': 'OK', '747': 'OK', '748': 'OK', '749': 'OK',
  // Oregon (970-979)
  '970': 'OR', '971': 'OR', '972': 'OR', '973': 'OR', '974': 'OR', '975': 'OR', '976': 'OR', '977': 'OR', '978': 'OR', '979': 'OR',
  // Pennsylvania (150-196)
  '150': 'PA', '151': 'PA', '152': 'PA', '153': 'PA', '154': 'PA', '155': 'PA', '156': 'PA', '157': 'PA', '158': 'PA', '159': 'PA',
  '160': 'PA', '161': 'PA', '162': 'PA', '163': 'PA', '164': 'PA', '165': 'PA', '166': 'PA', '167': 'PA', '168': 'PA', '169': 'PA',
  '170': 'PA', '171': 'PA', '172': 'PA', '173': 'PA', '174': 'PA', '175': 'PA', '176': 'PA', '177': 'PA', '178': 'PA', '179': 'PA',
  '180': 'PA', '181': 'PA', '182': 'PA', '183': 'PA', '184': 'PA', '185': 'PA', '186': 'PA', '187': 'PA', '188': 'PA', '189': 'PA',
  '190': 'PA', '191': 'PA', '192': 'PA', '193': 'PA', '194': 'PA', '195': 'PA', '196': 'PA',
  // Rhode Island (028-029)
  '028': 'RI', '029': 'RI',
  // South Carolina (290-299)
  '290': 'SC', '291': 'SC', '292': 'SC', '293': 'SC', '294': 'SC', '295': 'SC', '296': 'SC', '297': 'SC', '298': 'SC', '299': 'SC',
  // South Dakota (570-577)
  '570': 'SD', '571': 'SD', '572': 'SD', '573': 'SD', '574': 'SD', '575': 'SD', '576': 'SD', '577': 'SD',
  // Tennessee (370-385)
  '370': 'TN', '371': 'TN', '372': 'TN', '373': 'TN', '374': 'TN', '375': 'TN', '376': 'TN', '377': 'TN', '378': 'TN', '379': 'TN',
  '380': 'TN', '381': 'TN', '382': 'TN', '383': 'TN', '384': 'TN', '385': 'TN',
  // Texas (750-799, 885)
  '750': 'TX', '751': 'TX', '752': 'TX', '753': 'TX', '754': 'TX', '755': 'TX', '756': 'TX', '757': 'TX', '758': 'TX', '759': 'TX',
  '760': 'TX', '761': 'TX', '762': 'TX', '763': 'TX', '764': 'TX', '765': 'TX', '766': 'TX', '767': 'TX', '768': 'TX', '769': 'TX',
  '770': 'TX', '771': 'TX', '772': 'TX', '773': 'TX', '774': 'TX', '775': 'TX', '776': 'TX', '777': 'TX', '778': 'TX', '779': 'TX',
  '780': 'TX', '781': 'TX', '782': 'TX', '783': 'TX', '784': 'TX', '785': 'TX', '786': 'TX', '787': 'TX', '788': 'TX', '789': 'TX',
  '790': 'TX', '791': 'TX', '792': 'TX', '793': 'TX', '794': 'TX', '795': 'TX', '796': 'TX', '797': 'TX', '798': 'TX', '799': 'TX',
  '885': 'TX',
  // Utah (840-847)
  '840': 'UT', '841': 'UT', '842': 'UT', '843': 'UT', '844': 'UT', '845': 'UT', '846': 'UT', '847': 'UT',
  // Vermont (050-059)
  '050': 'VT', '051': 'VT', '052': 'VT', '053': 'VT', '054': 'VT', '056': 'VT', '057': 'VT', '058': 'VT', '059': 'VT',
  // Virginia (220-246)
  '220': 'VA', '221': 'VA', '222': 'VA', '223': 'VA', '224': 'VA', '225': 'VA', '226': 'VA', '227': 'VA', '228': 'VA', '229': 'VA',
  '230': 'VA', '231': 'VA', '232': 'VA', '233': 'VA', '234': 'VA', '235': 'VA', '236': 'VA', '237': 'VA', '238': 'VA', '239': 'VA',
  '240': 'VA', '241': 'VA', '242': 'VA', '243': 'VA', '244': 'VA', '245': 'VA', '246': 'VA',
  // Washington (980-994)
  '980': 'WA', '981': 'WA', '982': 'WA', '983': 'WA', '984': 'WA', '985': 'WA', '986': 'WA', '988': 'WA', '989': 'WA',
  '990': 'WA', '991': 'WA', '992': 'WA', '993': 'WA', '994': 'WA',
  // Washington DC (200-205)
  '200': 'DC', '201': 'DC', '202': 'DC', '203': 'DC', '204': 'DC', '205': 'DC',
  // West Virginia (247-268)
  '247': 'WV', '248': 'WV', '249': 'WV', '250': 'WV', '251': 'WV', '252': 'WV', '253': 'WV', '254': 'WV', '255': 'WV', '256': 'WV',
  '257': 'WV', '258': 'WV', '259': 'WV', '260': 'WV', '261': 'WV', '262': 'WV', '263': 'WV', '264': 'WV', '265': 'WV', '266': 'WV', '267': 'WV', '268': 'WV',
  // Wisconsin (530-549)
  '530': 'WI', '531': 'WI', '532': 'WI', '534': 'WI', '535': 'WI', '536': 'WI', '537': 'WI', '538': 'WI', '539': 'WI',
  '540': 'WI', '541': 'WI', '542': 'WI', '543': 'WI', '544': 'WI', '545': 'WI', '546': 'WI', '547': 'WI', '548': 'WI', '549': 'WI',
  // Wyoming (820-831)
  '820': 'WY', '821': 'WY', '822': 'WY', '823': 'WY', '824': 'WY', '825': 'WY', '826': 'WY', '827': 'WY', '828': 'WY', '829': 'WY',
  '830': 'WY', '831': 'WY',
};

// ============================================================================
// TAX CALCULATION FUNCTIONS
// ============================================================================

function getStateFromZip(zip: string | undefined): string | null {
  if (!zip || zip.length < 3) return null;
  const prefix = zip.slice(0, 3);
  return ZIP_TO_STATE[prefix] || null;
}

type TaxCategory = keyof StateTaxConfig;

function getTaxCategory(pillar: string, subcategory?: string): TaxCategory {
  // Grocery detection
  if (subcategory === 'Grocery' || subcategory === 'Groceries' ||
      (pillar === 'Food & Dining' && subcategory !== 'Dining Out' && subcategory !== 'Delivery & Takeout' && 
       subcategory !== 'Coffee & Cafes' && subcategory !== 'Fast Food' && subcategory !== 'Restaurants')) {
    return 'grocery';
  }
  
  // Prepared food (restaurants, cafes, delivery)
  if (subcategory === 'Dining Out' || subcategory === 'Coffee & Cafes' || 
      subcategory === 'Delivery & Takeout' || subcategory === 'Fast Food' ||
      subcategory === 'Restaurants' || subcategory === 'Bars & Pubs') {
    return 'prepared_food';
  }
  
  // Clothing
  if (pillar === 'Style & Beauty' && 
      (subcategory === 'Clothing' || subcategory === 'Shoes & Accessories' || 
       subcategory === 'Apparel' || subcategory === 'Fashion')) {
    return 'clothing';
  }
  
  // Medical/Pharmacy
  if (pillar === 'Health & Wellness' && 
      (subcategory === 'Pharmacy & Prescriptions' || subcategory === 'Pharmacy' ||
       subcategory === 'Medical & Doctor Visits' || subcategory === 'Vitamins & Supplements' ||
       subcategory === 'Healthcare' || subcategory === 'Medical')) {
    return 'medical';
  }
  
  // Digital services
  if ((pillar === 'Technology & Digital Life' || pillar === 'Entertainment & Leisure') && 
      (subcategory === 'Software & Apps' || subcategory === 'Streaming Services' || 
       subcategory === 'Cloud Storage' || subcategory === 'Digital Subscriptions' ||
       subcategory === 'Gaming Subscriptions')) {
    return 'digital';
  }
  
  return 'general';
}

function getTaxRate(state: string | null, taxCategory: TaxCategory): number {
  if (!state) return 0.07; // Default 7% fallback
  const config = STATE_TAX_RATES[state];
  if (!config) return 0.07;
  return config[taxCategory];
}

interface TaxBreakdown {
  original_amount: number;
  pre_tax_amount: number;
  estimated_tax: number;
  tax_rate_pct: string;
  tax_category: TaxCategory;
  state: string | null;
  is_exempt: boolean;
}

function calculateTaxBreakdown(
  amount: number, 
  zip: string | undefined, 
  pillar: string,
  subcategory?: string
): TaxBreakdown {
  const state = getStateFromZip(zip);
  const taxCategory = getTaxCategory(pillar, subcategory);
  const taxRate = getTaxRate(state, taxCategory);
  
  const preTaxAmount = taxRate > 0 ? amount / (1 + taxRate) : amount;
  const estimatedTax = amount - preTaxAmount;
  
  return {
    original_amount: amount,
    pre_tax_amount: Math.round(preTaxAmount * 100) / 100,
    estimated_tax: Math.round(estimatedTax * 100) / 100,
    tax_rate_pct: (taxRate * 100).toFixed(1) + '%',
    tax_category: taxCategory,
    state: state,
    is_exempt: taxRate === 0
  };
}

// ============================================================================
// TYPES
// ============================================================================

interface Transaction {
  transaction_id: string;
  merchant_name: string;
  amount: number;
  date: string;
  subcategory?: string;
  zip_code?: string;
  home_zip?: string;
}

interface PillarInput {
  pillar: string;
  totalSpend: number;
  transactions: Transaction[];
}

interface AnalyzedTransaction {
  transaction_id: string;
  inferred_purchase: string;
  confidence: number;
  tax_breakdown?: {
    pre_tax: number;
    tax: number;
    rate: string;
    state: string | null;
    category: string;
  };
}

interface AnalyzedPillar {
  pillar: string;
  totalSpend: number;
  transactions: AnalyzedTransaction[];
}

interface UserPersona {
  summary: string;
  lifestyle_traits: string[];
  spending_behaviors: string[];
  interests: string[];
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pillars, home_zip, customer_context } = await req.json() as { 
      pillars: PillarInput[]; 
      home_zip?: string;
      customer_context?: {
        income_level?: string;
        industry?: string;
        family_status?: string;
      };
    };
    
    if (!pillars || pillars.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No pillars provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Pre-compute tax breakdown for each transaction - send ALL transactions for analysis
    const pillarsSummary = pillars.map(p => ({
      pillar: p.pillar,
      totalSpend: p.totalSpend,
      transactions: p.transactions.map(t => {
        const zip = t.zip_code || t.home_zip || home_zip || '';
        const tax = calculateTaxBreakdown(t.amount, zip, p.pillar, t.subcategory);
        
        return {
          transaction_id: t.transaction_id,
          merchant: t.merchant_name,
          amount: t.amount,
          pre_tax: tax.pre_tax_amount,
          tax_rate: tax.tax_rate_pct,
          state: tax.state,
          subcategory: t.subcategory
        };
      })
    }));

    // Build customer context section for the prompt if available
    const customerContextSection = customer_context ? `
CUSTOMER PROFILE:
- Income Level: ${customer_context.income_level || 'Unknown'}
- Industry: ${customer_context.industry || 'Unknown'}
- Family Status: ${customer_context.family_status || 'Unknown'}
- Home ZIP: ${home_zip || 'Unknown'}

Use this customer profile to create a more accurate, personalized persona that reflects their demographic characteristics and likely lifestyle preferences.
` : '';

    const prompt = `Analyze these customer transactions and infer what they purchased.
${customerContextSection}
INPUT:
${JSON.stringify(pillarsSummary, null, 2)}

TASK 1: For each transaction, infer SPECIFIC products using STRICT PRICE MATCHING.

PRICE-MATCHING RULES (STRICT - FOLLOW EXACTLY):

OPTION 1 - EXACT SINGLE-ITEM MATCH (95%+ confidence):
- The pre_tax amount matches a known product price EXACTLY (±$1)
- Example: pre_tax $55.00 at Titleist → "Titleist Pro V1 golf balls, dozen"
- Example: pre_tax $249.00 at Apple → "AirPods Pro 2nd Gen"

OPTION 2 - EXACT MULTI-ITEM MATCH (85-95% confidence):
- When NO single product matches the pre_tax amount exactly, find multiple items that SUM TO EXACTLY the pre_tax amount
- List each item with its individual price
- The item prices MUST add up to the pre_tax total exactly
- Example: pre_tax $152.72 at golf shop → "TaylorMade golf glove ($28) + Titleist Pro V1 dozen ($55) + golf shorts ($69.72)"
- Example: pre_tax $89.50 at sporting goods → "yoga mat ($45) + resistance bands ($25) + water bottle ($19.50)"

CRITICAL RULES - NEVER VIOLATE:
❌ NEVER guess a single expensive item that doesn't match the price
❌ NEVER add notes like "*seems low for this item*" or "*likely discounted*"
❌ NEVER suggest an item costs less than its actual retail price
❌ NEVER use approximate language like "roughly" or "around"

✅ ALWAYS: If single item doesn't fit → break into multiple items that sum exactly
✅ ALWAYS: Use real product prices from your knowledge
✅ ALWAYS: Be specific about each item in a multi-item purchase
✅ ALWAYS: Item prices must mathematically add to pre_tax amount

FORMAT: Include tax info in output:
- "product(s) description ($XX.XX pre-tax @ X.XX% STATE)"
- If multi-item: "item1 ($X) + item2 ($Y) + item3 ($Z) ($XX.XX pre-tax @ X.XX% STATE)"

EXAMPLES:
✅ CORRECT: pre_tax $54.11 at Titleist → "Titleist Pro V1 golf balls, dozen ($54.11 pre-tax @ 8.25% TX)"
✅ CORRECT: pre_tax $152.72 at PGA Superstore → "golf glove ($28) + dozen Pro V1s ($55) + golf shorts ($69.72) ($152.72 pre-tax @ 8.25% TX)"
✅ CORRECT: pre_tax $165.00 at TaylorMade → "TaylorMade Tour Response balls ($45) + golf glove ($35) + 2 headcovers ($85) ($165.00 pre-tax)"
❌ WRONG: "TaylorMade Stealth Driver ($165 pre-tax) - *Note: seems low for this item*"

TASK 2: Create a customer persona based on all transactions${customer_context ? ' AND the provided customer profile. Incorporate the income level, industry, and family status into the persona summary and traits.' : '.'}

For "spending_behaviors", ANALYZE THE ACTUAL TRANSACTION DATA to detect specific patterns:

FREQUENCY PATTERNS (analyze transaction dates & counts):
- "Weekly coffee ritual" (consistent weekly purchases in a category)
- "Impulse buyer" (irregular, clustered purchases)
- "Subscription-style spender" (recurring similar amounts)
- "Seasonal spender" (concentrated in certain time periods)

AMOUNT PATTERNS (analyze transaction amounts):
- "Premium buyer" (consistently high-value purchases)
- "Value-conscious shopper" (many smaller transactions)
- "Big-ticket focused" (fewer, larger purchases)
- "Micro-transaction heavy" (many small purchases under $20)

CATEGORY PATTERNS (analyze pillar distribution):
- "Lifestyle-balanced spender" (spread across multiple pillars)
- "Category-concentrated" (heavy in 1-2 pillars)
- "Diversified explorer" (many different merchants/categories)

MERCHANT PATTERNS (analyze merchant diversity):
- "Brand loyal" (repeat purchases at same merchants)
- "Variety seeker" (wide variety of merchants)
- "Convenience-driven" (proximity-based choices like local shops)

Generate 3-5 SPECIFIC spending behaviors based on ACTUAL patterns you detect in the transaction data.
Be specific and evidence-based, not generic.

GOOD spending_behaviors examples:
- "Weekly coffee ritual ($15-20 range)"
- "Premium dining preference"
- "Impulse sports equipment buyer"
- "Brand-loyal in athletic wear"
- "Weekend splurger"
- "Subscription-style recurring purchases"
- "Value-conscious grocery shopper"

BAD spending_behaviors examples (too generic - NEVER USE):
- "Spends money regularly"
- "Makes purchases"
- "Uses credit card"
- "Shops at stores"

RESPOND WITH JSON ONLY:
{
  "analyzed_pillars": [
    {
      "pillar": "Pillar Name",
      "totalSpend": 1234.56,
      "transactions": [
        {
          "transaction_id": "id",
          "inferred_purchase": "item1 ($X) + item2 ($Y) ($89.00 pre-tax @ 6.25% CA)",
          "confidence": 0.85
        }
      ]
    }
  ],
  "user_persona": {
    "summary": "2-3 sentence lifestyle summary",
    "lifestyle_traits": ["trait1", "trait2", "trait3"],
    "spending_behaviors": ["Weekly coffee ritual", "Premium dining preference", "Brand-loyal in sportswear"],
    "interests": ["interest1", "interest2"]
  }
}`;

    console.log('Calling Lovable AI for pillar analysis...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);
    
    let response;
    try {
      response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { 
              role: 'system', 
              content: 'You are a financial analyst. Infer specific products from transaction amounts. Respond with valid JSON only, no markdown.' 
            },
            { role: 'user', content: prompt }
          ],
        }),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: 'AI analysis timed out.' }),
          { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw fetchError;
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response from AI');
    }

    console.log('AI Response received, parsing...');
    console.log('Response length:', content.length);
    
    // Clean up the response - remove markdown code blocks if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.slice(7);
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith('```')) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();

    // Attempt to parse JSON with fallback for truncated responses
    let result;
    try {
      result = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.warn('JSON parse failed, attempting to repair truncated JSON...');
      
      // Try to repair truncated JSON by closing open structures
      let repairedContent = cleanedContent;
      
      // Count open brackets/braces
      const openBraces = (repairedContent.match(/{/g) || []).length;
      const closeBraces = (repairedContent.match(/}/g) || []).length;
      const openBrackets = (repairedContent.match(/\[/g) || []).length;
      const closeBrackets = (repairedContent.match(/]/g) || []).length;
      
      // Find last complete object/array and truncate there
      // Look for patterns like }, { or }, ] or ] } that indicate structure boundaries
      const lastCompleteMatch = repairedContent.match(/.*[}\]]\s*[,]?\s*$/s);
      
      if (lastCompleteMatch) {
        // Try to find the last complete transaction entry
        const pillarMatches = repairedContent.match(/"pillar_analyses"\s*:\s*\[\s*(\{[^]*?\})\s*[,\]]/);
        
        if (pillarMatches) {
          // We have at least one complete pillar analysis, create minimal valid response
          try {
            // Extract what we can parse
            const partialPillarMatch = repairedContent.match(/"pillar_analyses"\s*:\s*\[([^]*)/);
            if (partialPillarMatch) {
              // Build a minimal valid response with what we have
              const pillarsContent = partialPillarMatch[1];
              
              // Find complete pillar objects
              const completePillars: string[] = [];
              let depth = 0;
              let start = -1;
              
              for (let i = 0; i < pillarsContent.length; i++) {
                if (pillarsContent[i] === '{') {
                  if (depth === 0) start = i;
                  depth++;
                } else if (pillarsContent[i] === '}') {
                  depth--;
                  if (depth === 0 && start >= 0) {
                    completePillars.push(pillarsContent.slice(start, i + 1));
                    start = -1;
                  }
                }
              }
              
              if (completePillars.length > 0) {
                console.log(`Recovered ${completePillars.length} complete pillar analyses`);
                const recoveredResult = {
                  pillar_analyses: completePillars.map(p => {
                    try { return JSON.parse(p); } 
                    catch { return null; }
                  }).filter(Boolean),
                  unified_persona: {
                    lifestyle_traits: ["Active lifestyle enthusiast"],
                    spending_behaviors: ["Health-conscious consumer"],
                    interests: ["Fitness", "Wellness"]
                  }
                };
                result = recoveredResult;
              }
            }
          } catch (recoveryError) {
            console.error('Recovery attempt failed:', recoveryError);
          }
        }
      }
      
      // If we still don't have a result, create a fallback
      if (!result) {
        console.error('Could not repair JSON, returning fallback response');
        result = {
          pillar_analyses: pillars.map(p => ({
            pillar_name: p.pillarName,
            total_spend: p.totalSpend,
            transaction_count: p.transactions.length,
            transactions: p.transactions.slice(0, 3).map(t => ({
              transaction_id: t.transaction_id,
              merchant_name: t.merchant_name,
              amount: t.amount,
              inferred_purchase: 'Unable to analyze - please retry',
              confidence: 0.5
            }))
          })),
          unified_persona: {
            lifestyle_traits: ["Analysis incomplete - please retry"],
            spending_behaviors: ["Retry analysis for full results"],
            interests: ["Pending analysis"]
          }
        };
      }
    }
    
    console.log('Successfully parsed AI analysis');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-pillar-transactions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});