import { api } from '@/utils/kyInstance';
import { toast } from 'sonner';
import { z } from 'zod';

const languageSchemaCountry = (language: string) => {
  const schema = z.object({
    alpha2: z.string(),
    alpha3: z.string(),
    en: z.string(), // default language
  });
  if (language !== 'en') {
    const schemaWithNewLanguage = schema.merge(
      z.object({ [language]: z.string() }),
    );
    return schemaWithNewLanguage;
  }
  return schema;
};

const fetchCountriesResponseSchema = (language: string) => {
  return z.object({
    data: z.array(languageSchemaCountry(language)),
    success: z.boolean(),
  });
};

const languageSchemaCity = (language: string) => {
  const schema = z.object({
    asciiName: z.string(),
    geonameId: z.string(),
  });
  const schemaWithNewLanguage = schema.merge(
    z.object({ [language]: z.string().optional() }),
  );
  return schemaWithNewLanguage;
};

const fetchCitiesResponseSchema = (language: string) => {
  return z.object({
    data: z.array(languageSchemaCity(language)),
    success: z.boolean(),
  });
};

export const fetchCountries = async ({
  language,
  search,
  limit = 20,
}: {
  language: string;
  search: string;
  limit?: number;
}) => {
  try {
    const response = await api.get(`countries?language=${language}&search=${search}&limit=${limit}&skip=0`,
    );
    const parse = fetchCountriesResponseSchema(language).parse(
      await response.json(),
    );
    return parse;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to fetch countries: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to fetch countries: Error ONE-2');
    } else {
      toast.error('Unable to fetch countries: Error ONE-3');
    }
    throw Error('Unable to fetch countries');
  }
};

export const fetchCities = async ({
  language,
  countryCode,
  search,
  limit = 20,
}: {
  language: string;
  countryCode: string;
  search: string;
  limit?: number;
}) => {
  try {
    const response = await api.get(`cities?language=${language}&countryCode=${countryCode}&search=${search}&limit=${limit}&skip=0`,
    );
    const parse = fetchCitiesResponseSchema(language).parse(
      await response.json(),
    );
    return parse;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to fetch cities: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to fetch cities: Error ONE-2');
    } else {
      toast.error('Unable to fetch cities: Error ONE-3');
    }
    throw Error('Unable to fetch cities');
  }
};
