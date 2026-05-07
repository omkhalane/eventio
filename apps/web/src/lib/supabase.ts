import { createClient } from '@supabase/supabase-js';

import { getPublicConfig } from './publicConfig';

const publicConfig = getPublicConfig();
const supabaseUrl = publicConfig.supabaseUrl;
const supabaseAnonKey = publicConfig.supabaseAnonKey;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
