import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://feygyskwxzcbsamnzqfp.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZleWd5c2t3eHpjYnNhbW56cWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTc5NzUsImV4cCI6MjA3NjI5Mzk3NX0.FDeIqj5oObm7u5MkxsKdP6KrRHW1HKwBj9_Id7kKbMI';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth helpers
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUp = async (email: string, password: string, metadata?: object) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Profile helpers
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfile = async (userId: string, updates: object) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

export const createProfile = async (profile: object) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();
  return { data, error };
};

// Generic function to check if a table exists and query it
export const queryTable = async (tableName: string, options?: {
  select?: string;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  eq?: { column: string; value: any };
}) => {
  try {
    let query = supabase.from(tableName).select(options?.select || '*');
    
    if (options?.eq) {
      query = query.eq(options.eq.column, options.eq.value);
    }
    
    if (options?.orderBy) {
      query = query.order(options.orderBy, { 
        ascending: options.orderDirection === 'asc' 
      });
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error && error.code === '42P01') {
      // Table does not exist
      return { data: null, error: null, exists: false };
    }
    
    return { data, error, exists: !error };
  } catch (error) {
    return { data: null, error, exists: false };
  }
};

// Generic insert function
export const insertIntoTable = async (tableName: string, data: object | object[]) => {
  try {
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(data)
      .select();
    
    return { data: result, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Generic update function
export const updateTable = async (tableName: string, id: string, updates: object) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Generic delete function
export const deleteFromTable = async (tableName: string, id: string) => {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    
    return { error };
  } catch (error) {
    return { error };
  }
};
