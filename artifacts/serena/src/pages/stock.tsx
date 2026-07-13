import { useState } from 'react';
import { Link } from 'wouter';
import { useGetInventory, getGetInventoryQueryKey, useUpdateInventoryItem } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Box, Car, Home, ArrowLeft, Plus, Save, Users, Loader2 } from 'lucide-react';

const CofreInput = ({ name, initialQty }: { name: string, initialQty: number }) => {
  const [qty, setQty] = useState(initialQty.toString());
  const updateItem = useUpdateInventoryItem();
  const queryClient = useQueryClient();

  const handleBlur = () => {
    if (qty === initialQty.toString()) return;
    const parsed = parseInt(qty, 10);
    if (isNaN(parsed)) return;
    
    updateItem.mutate({
      data: { categoria: 'cofres', item: name, valor: qty }
    }, {
      onSuccess: () => {
        queryClient.setQueryData(getGetInventoryQueryKey(), (old: any) => {
          if (!old) return old;
          return {
            ...old,
            cofres: { ...old.cofres, [name]: parsed }
          }
        });
      }
    });
  };

  return (
    <Input 
      type="number" 
      value={qty} 
      onChange={e => setQty(e.target.value)}
      onBlur={handleBlur}
      className="w-24 h-8 text-xs font-mono bg-white"
      data-testid={`input-cofre-${name.replace(/\s+/g, '-')}`}
    />
  );
};

const StatusSelect = ({ category, name, currentStatus, options }: { category: 'salas'|'vehiculos', name: string, currentStatus: string, options: string[] }) => {
  const updateItem = useUpdateInventoryItem();
  const queryClient = useQueryClient();

  return (
    <Select 
      value={currentStatus} 
      onValueChange={(newStatus) => {
        updateItem.mutate({
          data: { categoria: category, item: name, valor: newStatus }
        }, {
          onSuccess: () => {
             queryClient.setQueryData(getGetInventoryQueryKey(), (old: any) => {
               if (!old) return old;
               return {
                 ...old,
                 [category]: { ...old[category], [name]: newStatus }
               }
             });
          }
        });
      }}
    >
      <SelectTrigger className="w-[180px] h-8 text-xs bg-white" data-testid={`select-${category}-${name.replace(/\s+/g, '-')}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(o => (
          <SelectItem key={o} value={o}>{o}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  const isAvailable = s === 'disponible';
  const isMaintenance = s.includes('mantenimiento') || s.includes('limpieza');
  
  const color = isAvailable ? 'bg-green-100 text-green-700' : 
                isMaintenance ? 'bg-red-100 text-red-700' : 
                'bg-amber-100 text-amber-700';
  
  const dotColor = isAvailable ? 'bg-green-500' : 
                   isMaintenance ? 'bg-red-500' : 
                   'bg-amber-500';
  
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit ${color}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></div>
      {status}
    </div>
  );
}

export default function StockPage() {
  const queryClient = useQueryClient();
  const { data: inventory, isLoading } = useGetInventory();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState<{categoria: 'salas'|'vehiculos'|'cofres', nombre: string, valorInicial: string}>({ categoria: 'salas', nombre: '', valorInicial: 'Disponible' });
  const [isAdding, setIsAdding] = useState(false);

  const openAddModal = (categoria: 'salas' | 'vehiculos' | 'cofres') => {
    setAddForm({ categoria, nombre: '', valorInicial: categoria === 'cofres' ? '0' : 'Disponible' });
    setIsAddModalOpen(true);
  };

  const handleAddSave = async () => {
    setIsAdding(true);
    try {
      await fetch('/api/inventory/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          categoria: addForm.categoria, 
          nombre: addForm.nombre, 
          valorInicial: addForm.categoria === 'cofres' ? parseInt(addForm.valorInicial, 10) : addForm.valorInicial 
        })
      });
      await queryClient.invalidateQueries({ queryKey: getGetInventoryQueryKey() });
      setIsAddModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const salaOptions = ["Disponible", "Reservada", "En Mantenimiento", "En Limpieza"];
  const vehiculoOptions = ["Disponible", "Asignado", "En Mantenimiento", "En Limpieza"];

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="flex-none flex items-center justify-between px-4 sm:px-6 py-4 border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-center w-8 h-8 bg-slate-50 rounded-full border border-slate-200 hover:bg-slate-100" data-testid="link-back-home">
            <ArrowLeft className="w-4 h-4"/>
          </Link>
          <div>
            <h1 className="font-serif text-lg sm:text-xl font-bold text-primary leading-tight">Gestión de Inventario</h1>
            <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em]">Serena</p>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-xs sm:text-sm font-medium">
          <Link href="/login" className="text-brand-gold hover:text-amber-600 transition-colors flex items-center gap-1.5" data-testid="link-nav-login">
            <Users className="w-4 h-4"/> <span className="hidden sm:inline">Panel de Personal</span>
          </Link>
        </nav>
      </header>
      
      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 pb-12">
        {isLoading ? (
           <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-brand-gold"/></div>
        ) : (
          <>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 sm:px-6 border-b bg-slate-50/80 flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-primary flex items-center gap-2">
                  <Home className="w-5 h-5 text-brand-gold"/>
                  Salas de Velación <Badge variant="secondary" className="ml-2 font-mono bg-white border border-slate-200 text-slate-600">{Object.keys(inventory?.salas || {}).length}</Badge>
                </h3>
                <Button variant="outline" size="sm" onClick={() => openAddModal('salas')} data-testid="btn-add-sala" className="bg-white hover:bg-slate-50 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1.5"/> Agregar Sala
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[30%]">Nombre de Sala</TableHead>
                      <TableHead className="w-[30%]">Estado Actual</TableHead>
                      <TableHead className="w-[40%] text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(inventory?.salas || {}).map(([name, status]: [string, any]) => (
                      <TableRow key={name}>
                        <TableCell className="font-medium text-slate-800">{name}</TableCell>
                        <TableCell><StatusPill status={status} /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <StatusSelect category="salas" name={name} currentStatus={status} options={salaOptions} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {Object.keys(inventory?.salas || {}).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No hay salas registradas en el inventario.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 sm:px-6 border-b bg-slate-50/80 flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-primary flex items-center gap-2">
                  <Car className="w-5 h-5 text-brand-gold"/>
                  Flota Vehicular <Badge variant="secondary" className="ml-2 font-mono bg-white border border-slate-200 text-slate-600">{Object.keys(inventory?.vehiculos || {}).length}</Badge>
                </h3>
                <Button variant="outline" size="sm" onClick={() => openAddModal('vehiculos')} data-testid="btn-add-vehiculo" className="bg-white hover:bg-slate-50 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1.5"/> Agregar Vehículo
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[30%]">Vehículo / Modelo</TableHead>
                      <TableHead className="w-[30%]">Estado Actual</TableHead>
                      <TableHead className="w-[40%] text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(inventory?.vehiculos || {}).map(([name, status]: [string, any]) => (
                      <TableRow key={name}>
                        <TableCell className="font-medium text-slate-800">{name}</TableCell>
                        <TableCell><StatusPill status={status} /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <StatusSelect category="vehiculos" name={name} currentStatus={status} options={vehiculoOptions} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {Object.keys(inventory?.vehiculos || {}).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No hay vehículos registrados en el inventario.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 sm:px-6 border-b bg-slate-50/80 flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-primary flex items-center gap-2">
                  <Box className="w-5 h-5 text-brand-gold"/>
                  Cofres (Stock) <Badge variant="secondary" className="ml-2 font-mono bg-white border border-slate-200 text-slate-600">{Object.keys(inventory?.cofres || {}).length}</Badge>
                </h3>
                <Button variant="outline" size="sm" onClick={() => openAddModal('cofres')} data-testid="btn-add-cofre" className="bg-white hover:bg-slate-50 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1.5"/> Agregar Modelo
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[50%]">Modelo de Cofre</TableHead>
                      <TableHead className="w-[50%] text-right">Cantidad en Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(inventory?.cofres || {}).map(([name, qty]: [string, any]) => (
                      <TableRow key={name}>
                        <TableCell className="font-medium text-slate-800">{name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <CofreInput name={name} initialQty={qty} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {Object.keys(inventory?.cofres || {}).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">No hay cofres registrados en el inventario.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
      </main>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-primary">Agregar al Inventario</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Categoría</Label>
              <Select 
                value={addForm.categoria} 
                onValueChange={v => setAddForm(prev => ({ 
                  ...prev, 
                  categoria: v as any, 
                  valorInicial: v === 'cofres' ? '0' : 'Disponible' 
                }))}
              >
                <SelectTrigger data-testid="select-add-categoria">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salas">Salas de Velación</SelectItem>
                  <SelectItem value="vehiculos">Flota Vehicular</SelectItem>
                  <SelectItem value="cofres">Cofres (Ataúdes)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Nombre / Modelo</Label>
              <Input 
                value={addForm.nombre} 
                onChange={e => setAddForm(prev => ({ ...prev, nombre: e.target.value }))} 
                placeholder={addForm.categoria === 'salas' ? "Ej: Sala Imperial" : addForm.categoria === 'vehiculos' ? "Ej: Ford Explorer Negra" : "Ej: Cofre Caoba Standard"}
                data-testid="input-add-nombre"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{addForm.categoria === 'cofres' ? 'Cantidad Inicial' : 'Estado Inicial'}</Label>
              {addForm.categoria === 'cofres' ? (
                <Input 
                  type="number" 
                  value={addForm.valorInicial} 
                  onChange={e => setAddForm(prev => ({ ...prev, valorInicial: e.target.value }))}
                  data-testid="input-add-valor"
                />
              ) : (
                <Select 
                  value={addForm.valorInicial} 
                  onValueChange={v => setAddForm(prev => ({ ...prev, valorInicial: v }))}
                >
                  <SelectTrigger data-testid="select-add-valor">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {addForm.categoria === 'vehiculos' ? (
                      <>
                        <SelectItem value="Disponible">Disponible</SelectItem>
                        <SelectItem value="Asignado">Asignado</SelectItem>
                        <SelectItem value="En Mantenimiento">En Mantenimiento</SelectItem>
                        <SelectItem value="En Limpieza">En Limpieza</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="Disponible">Disponible</SelectItem>
                        <SelectItem value="Reservada">Reservada</SelectItem>
                        <SelectItem value="En Mantenimiento">En Mantenimiento</SelectItem>
                        <SelectItem value="En Limpieza">En Limpieza</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddSave} disabled={!addForm.nombre || isAdding} data-testid="btn-add-save" className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>}
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
