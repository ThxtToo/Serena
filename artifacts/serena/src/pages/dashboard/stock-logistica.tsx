import { useState, useRef } from 'react';
import { useGetInventory, useUpdateInventoryItem, getGetInventoryQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MapPin, Truck, Box } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function StockLogistica() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: inventory, isLoading } = useGetInventory();
  const updateInventory = useUpdateInventoryItem();

  const handleStatusChange = (categoria: 'salas' | 'vehiculos', item: string, valor: string) => {
    updateInventory.mutate(
      { data: { categoria, item, valor } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetInventoryQueryKey() });
          toast({
            title: "Inventario actualizado",
            description: `El estado de ${item} se actualizó a ${valor}`,
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo actualizar el inventario",
          });
        }
      }
    );
  };

  const handleQuantityBlur = (item: string, valor: string) => {
    updateInventory.mutate(
      { data: { categoria: 'cofres', item, valor } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetInventoryQueryKey() });
          toast({
            title: "Stock actualizado",
            description: `Cantidad de ${item} actualizada`,
          });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-brand-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!inventory) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Salas */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-primary">
            <MapPin className="w-5 h-5 text-brand-gold" />
            Salas de Velación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(inventory.salas).map(([sala, status]) => (
              <div key={sala} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/20 transition-colors">
                <span className="font-medium text-sm">{sala}</span>
                <div className="w-[160px]">
                  <Select 
                    defaultValue={status} 
                    onValueChange={(val) => handleStatusChange('salas', sala, val)}
                  >
                    <SelectTrigger className={`h-8 text-xs font-medium border-0 ring-1 ring-inset ${
                      status === 'Disponible' ? 'bg-green-50 text-green-700 ring-green-500/30' :
                      status === 'Reservada' ? 'bg-amber-50 text-amber-700 ring-amber-500/30' :
                      'bg-slate-50 text-slate-700 ring-slate-500/30'
                    }`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Disponible">Disponible</SelectItem>
                      <SelectItem value="Reservada">Reservada</SelectItem>
                      <SelectItem value="En Limpieza">En Limpieza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vehículos */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-primary">
            <Truck className="w-5 h-5 text-brand-gold" />
            Flota Vehicular
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(inventory.vehiculos).map(([vehiculo, status]) => (
              <div key={vehiculo} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/20 transition-colors">
                <span className="font-medium text-sm">{vehiculo}</span>
                <div className="w-[160px]">
                  <Select 
                    defaultValue={status} 
                    onValueChange={(val) => handleStatusChange('vehiculos', vehiculo, val)}
                  >
                    <SelectTrigger className={`h-8 text-xs font-medium border-0 ring-1 ring-inset ${
                      status === 'Disponible' ? 'bg-green-50 text-green-700 ring-green-500/30' :
                      status === 'Asignado' ? 'bg-blue-50 text-blue-700 ring-blue-500/30' :
                      'bg-red-50 text-red-700 ring-red-500/30'
                    }`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Disponible">Disponible</SelectItem>
                      <SelectItem value="Asignado">Asignado</SelectItem>
                      <SelectItem value="En Mantenimiento">En Mantenimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cofres */}
      <Card className="border-border lg:col-span-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-primary">
            <Box className="w-5 h-5 text-brand-gold" />
            Inventario de Cofres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(inventory.cofres).map(([cofre, cantidad]) => (
              <div key={cofre} className="p-4 rounded-lg border border-border/60 bg-card flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm mb-1">{cofre}</p>
                  <p className="text-xs text-muted-foreground">Unidades disponibles</p>
                </div>
                <Input 
                  type="number" 
                  defaultValue={cantidad}
                  className="w-20 text-center font-semibold bg-muted/30"
                  onBlur={(e) => {
                    if (e.target.value !== String(cantidad)) {
                      handleQuantityBlur(cofre, e.target.value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
