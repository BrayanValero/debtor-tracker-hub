
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type ChartItem = {
  name: string;
  value: number;
};

const MetodosPagoChart = ({ data, colors }: { data: ChartItem[], colors: string[] }) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Métodos de Pago</CardTitle>
        <CardDescription>Distribución por método</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} pagos`, 'Cantidad']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col">
              <div className="flex items-center justify-center">
                <div
                  className="h-3 w-3 rounded-full mr-1"
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <span>{item.name}</span>
              </div>
              <span className="text-muted-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetodosPagoChart;
