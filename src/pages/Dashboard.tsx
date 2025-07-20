import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PositionCalculator } from "@/components/calculator/PositionCalculator";

const Dashboard = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
  return <Navigate to="/tradecopilot" replace />;
}
  return (
    <AppLayout>
      <PositionCalculator />
    </AppLayout>
  );
};

export default Dashboard;