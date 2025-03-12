
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatTooltipValue } from "@/utils/informes-utils";

type ChartData = {
  name: string;
  prestado: number;
  pagado: number;
};

const EvolucionPrestamosChart = ({ data }: { data: ChartData[] }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Evolución de Préstamos y Pagos</CardTitle>
        <CardDescription>Montos por mes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`$${formatTooltipValue(value)}`, '']}
                labelFormatter={(label) => `Mes: ${label}`}
              />
              <Legend />
              <Bar dataKey="prestado" name="Monto Prestado" fill="#3b82f6" />
              <Bar dataKey="pagado" name="Monto Pagado" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvolucionPrestamosChart;
