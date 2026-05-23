import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerListTrips } from "./tools/list-trips";
import { registerGetTripMessages } from "./tools/get-trip-messages";
import { registerGetTripFragments } from "./tools/get-trip-fragments";
import { registerStartTrip } from "./tools/list-recent-trip";

export function buildMcpServer(userId: string): McpServer {
  const server = new McpServer({
    name: "chronostitch-mcp",
    version: "1.0.0",
  });

  registerListTrips(server, userId);
  registerGetTripMessages(server, userId);
  registerGetTripFragments(server, userId);
  registerStartTrip(server, userId);

  return server;
}
