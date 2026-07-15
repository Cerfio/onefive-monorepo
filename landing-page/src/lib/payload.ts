import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Shared Payload Local API client.
 *
 * Payload now runs inside this app, so we talk to it in-process instead of
 * doing an HTTP round-trip to a separate CMS deployment. No PAYLOAD_URL, no
 * PAYLOAD_API_KEY, no extra lambda hop.
 *
 * `getPayload` memoises the instance internally, so calling this per request is
 * cheap.
 */
export const getPayloadClient = async () => getPayload({ config });
