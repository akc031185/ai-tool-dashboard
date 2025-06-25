import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type AiTool = {
  _id: string;
  name: string;
  category: string;
  progress: string;
};

export default function ToolsDashboard() {
  const { data, error, isLoading } = useSWR('/api/ai-tools', fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading tools.</div>;

  const tools: AiTool[] = data.tools;  // ✅ Type your fetched tools here

  return (
    <div>
      <h1>AI Tools Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {tools.map((tool: AiTool) => (  // ✅ Explicitly type "tool"
            <tr key={tool._id}>
              <td>{tool.name}</td>
              <td>{tool.category}</td>
              <td>{tool.progress}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
