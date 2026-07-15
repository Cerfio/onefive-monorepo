import { NextResponse } from "next/server";
import { unstable_cache as cache } from "next/cache";
import { getPayloadClient } from "@/lib/payload";

const getTeamMembers = cache(async () => {
  const payload = await getPayloadClient();
  const data = await payload.find({ collection: "team", limit: 100 });
  return data.docs;
});

export async function GET() {
  try {
    // NB: this route used to call `.json()` on the already-unwrapped docs array,
    // which threw on every request (a permanent 500). It now returns the shape
    // the handler always intended: { success: true, data: [...] }.
    const docs = await getTeamMembers();
    return NextResponse.json({ success: true, data: docs });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
