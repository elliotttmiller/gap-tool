import { Link } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function Clients() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Clients</h1>
          <p className="text-slate-500 mt-1">Manage client profiles and generated scenarios.</p>
        </div>
        <Button className="w-full sm:w-auto">Add Client</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left text-slate-500 whitespace-nowrap">
            <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">Name</th>
                <th scope="col" className="px-6 py-3 font-medium">Status</th>
                <th scope="col" className="px-6 py-3 font-medium">Last Updated</th>
                <th scope="col" className="px-6 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b border-slate-100 hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">
                  Elliott Miller
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Active</span>
                </td>
                <td className="px-6 py-4">
                  Today
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/scenarios/1/life">View Scenario</Link>
                  </Button>
                </td>
              </tr>
              <tr className="bg-white hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">
                  Sarah Davis
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">Draft</span>
                </td>
                <td className="px-6 py-4">
                  3 days ago
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="outline" size="sm">View Profile</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
