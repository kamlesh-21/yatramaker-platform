// client/vite-project/src/components/results/LocalExpensesSection.tsx
import { Card } from "@/components/ui/card";
import { Car, Utensils, MapPin, Check } from "lucide-react";

interface LocalExpensesSectionProps {
  localExpenses: {
    transportation?: number;
    meals?: number;
    attractions?: number;
  };
}

export function LocalExpensesSection({ localExpenses }: LocalExpensesSectionProps) {
  return (
    <section>
      <h2 className="font-display font-semibold text-2xl mb-4">Daily Local Expenses</h2>
      <Card className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <Car className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-xs text-muted-foreground mb-1">Local Transportation</div>
            <div className="font-semibold text-white dark:text-inherit">₹{(localExpenses.transportation || 0).toLocaleString()}</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <Utensils className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-xs text-muted-foreground mb-1">Meals</div>
            <div className="font-semibold text-white dark:text-inherit">₹{(localExpenses.meals || 0).toLocaleString()}</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-xs text-muted-foreground mb-1">Attractions</div>
            <div className="font-semibold text-white dark:text-inherit">₹{(localExpenses.attractions || 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
          <h4 className="font-semibold text-sm mb-2 text-yellow-900 dark:text-yellow-100">
            Coverage Includes:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-yellow-800 dark:text-yellow-200">
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              <span>Local taxi/auto</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              <span>3 meals per day</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              <span>Entry fees</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              <span>Basic shopping</span>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}