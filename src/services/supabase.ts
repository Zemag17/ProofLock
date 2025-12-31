import Constants from "expo-constants";
import { createClient } from "@supabase/supabase-js";

const expoExtra = Constants.expoConfig?.extra as
	| { SUPABASE_URL?: string; SUPABASE_ANON_KEY?: string }
	| undefined;

const supabaseUrl = expoExtra?.SUPABASE_URL;
const supabaseAnonKey = expoExtra?.SUPABASE_ANON_KEY;

const missingConfig = !supabaseUrl || !supabaseAnonKey;

const missingProxy = new Proxy(
	{},
	{
		get: () => {
			throw new Error("Supabase credentials are missing. Set extra.SUPABASE_URL and extra.SUPABASE_ANON_KEY in app config.");
		},
	}
) as any;

export const supabase = missingConfig ? missingProxy : createClient(supabaseUrl!, supabaseAnonKey!);
