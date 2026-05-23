import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getTripsByUser } from "@/lib/db/queries";

export function registerListTrips(server: McpServer, userId: string) {
  server.registerTool(
    "list_trips",
    {
      description: "获取用户的所有旅行记录，包括目的地、日期和状态。",
    },
    async () => {
      const trips = await getTripsByUser(userId);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(trips, null, 2),
          },
        ],
      };
    }
  );
}
