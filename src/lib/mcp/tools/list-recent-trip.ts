import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getTripsByUser } from "@/lib/db/queries";

export function registerStartTrip(server: McpServer, userId: string) {
  server.registerTool(
    "list_recent_trip",
    {
      description: "获取用户最近的一次旅行记录，方便快速查看当前行程信息。",
    },
    async () => {
      const trips = await getTripsByUser(userId);
      const recent = trips[0] ?? null;
      if (!recent) {
        return {
          isError: true,
          content: [{ type: "text", text: "暂无旅行记录，请先在启程页创建一次旅行。" }],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(recent, null, 2),
          },
        ],
      };
    }
  );
}
