
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

interface EvolucionPrestamosChartProps {
  data: Array<{
    mes: string;
    prestamos: number;
    pagos: number;
  }>;
}

const EvolucionPrestamosChart = ({ data }: EvolucionPrestamosChartProps) => {
  // Formatter function to safely handle different value types
  const formatTooltipValue = (value: any, name?: string) => {
    if (typeof value === 'number') {
      return [`$${value.toFixed(2)}`, name];
    }
    return [`${value}`, name];
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Evolución de Préstamos y Pagos</CardTitle>
        <CardDescription>
          Montos de préstamos y pagos durante los últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={formatTooltipValue} />
              <Legend />
              <Bar dataKey="prestamos" name="Préstamos" fill="#3b82f6" />
              <Bar dataKey="pagos" name="Pagos" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvolucionPrestamosChart;
