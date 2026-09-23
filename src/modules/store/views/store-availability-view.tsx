'use client'

import { Clock3, LoaderCircle, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import type { StoreAvailabilityMode } from '../schemas/store.schema'
import {
  weekdays,
  useStoreAvailabilityViewModel,
} from '../view-models/use-store-availability-view-model'

const modes: Array<{ value: StoreAvailabilityMode; title: string; description: string }> = [
  {
    value: 'ALWAYS_AVAILABLE',
    title: 'Sempre disponível',
    description: 'Seu estabelecimento sempre aparecerá aberto.',
  },
  {
    value: 'SCHEDULED',
    title: 'Disponível em dias e horários específicos',
    description: 'Escolha quando sua loja poderá receber pedidos.',
  },
  {
    value: 'SCHEDULED_ONLY',
    title: 'Disponível apenas para pedidos agendados',
    description: 'Pedidos imediatos ficam indisponíveis.',
  },
  {
    value: 'PERMANENTLY_CLOSED',
    title: 'Fechado permanentemente',
    description: 'A loja não receberá novos pedidos.',
  },
]

export function StoreAvailabilityView({ initialMode }: { initialMode: StoreAvailabilityMode }) {
  const vm = useStoreAvailabilityViewModel(initialMode)
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Disponibilidade da loja</CardTitle>
        <CardDescription>Defina quando o cardápio aceita novos pedidos.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6 border-b">
          <button
            className={cn(
              'border-b-2 px-1 pb-3 text-sm font-medium',
              vm.activeTab === 'schedule'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground',
            )}
            onClick={() => vm.setActiveTab('schedule')}
            type="button"
          >
            Horário de funcionamento
          </button>
          <button
            className={cn(
              'border-b-2 px-1 pb-3 text-sm font-medium',
              vm.activeTab === 'unavailability'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground',
            )}
            onClick={() => vm.setActiveTab('unavailability')}
            type="button"
          >
            Período de indisponibilidade
          </button>
        </div>
        {vm.activeTab === 'schedule' ? (
          <div className="mt-6 grid gap-6">
            <fieldset className="grid gap-4">
              {modes.map((item) => (
                <label
                  className={cn(
                    'flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors',
                    vm.mode === item.value && 'border-primary bg-primary/5',
                  )}
                  key={item.value}
                >
                  <input
                    checked={vm.mode === item.value}
                    className="mt-1 size-4 accent-primary"
                    name="availability-mode"
                    onChange={() => vm.setMode(item.value)}
                    type="radio"
                    value={item.value}
                  />
                  <span>
                    <span className="block font-semibold">{item.title}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
            {vm.mode === 'SCHEDULED' ? (
              <div className="grid gap-5">
                <p className="font-semibold">Dias e horários</p>
                {weekdays.map((day) => {
                  const indexed = vm.slots
                    .map((slot, index) => ({ slot, index }))
                    .filter(({ slot }) => slot.weekday === day.value)
                  return (
                    <div
                      className="rounded-xl border p-4"
                      key={day.value}
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          {day.short}
                        </span>
                        <p className="font-medium">{day.label}</p>
                      </div>
                      <div className="mt-4 grid gap-3">
                        {indexed.map(({ slot, index }) => (
                          <div
                            className="flex flex-wrap items-end gap-2"
                            key={index}
                          >
                            <label className="grid gap-1 text-xs font-medium">
                              Abre
                              <Input
                                onChange={(event) =>
                                  vm.updateSlot(index, { openTime: event.target.value })
                                }
                                type="time"
                                value={slot.openTime}
                              />
                            </label>
                            <span className="pb-2 text-sm text-muted-foreground">às</span>
                            <label className="grid gap-1 text-xs font-medium">
                              Fecha
                              <Input
                                onChange={(event) =>
                                  vm.updateSlot(index, { closeTime: event.target.value })
                                }
                                type="time"
                                value={slot.closeTime}
                              />
                            </label>
                            <Button
                              aria-label="Remover horário"
                              onClick={() => vm.removeSlot(index)}
                              size="icon"
                              type="button"
                              variant="ghost"
                            >
                              <Trash2 className="text-destructive" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          className="w-fit"
                          onClick={() => vm.addSlot(day.value)}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          <Plus /> Horário
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : null}
            <div className="flex items-center justify-between border-t pt-5">
              <p className="text-sm text-muted-foreground">
                {vm.mode === 'SCHEDULED'
                  ? 'Os intervalos devem estar em ordem e não podem se sobrepor.'
                  : 'A alteração será aplicada imediatamente.'}
              </p>
              <Button
                disabled={vm.saveMutation.isPending}
                onClick={() => vm.saveMutation.mutate()}
                type="button"
              >
                {vm.saveMutation.isPending ? <LoaderCircle className="animate-spin" /> : null}Salvar
                disponibilidade
              </Button>
            </div>
            {vm.saveMutation.isError ? (
              <p className="text-sm text-destructive">
                Não foi possível salvar. Revise os horários informados.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mt-6 max-w-xl">
            <p className="text-sm text-muted-foreground">
              Feche temporariamente a loja. Ao terminar o período, ela volta a seguir a configuração
              acima.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Início
                <Input
                  onChange={(event) => vm.setPeriod({ ...vm.period, startsAt: event.target.value })}
                  type="datetime-local"
                  value={vm.period.startsAt}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Fim
                <Input
                  onChange={(event) => vm.setPeriod({ ...vm.period, endsAt: event.target.value })}
                  type="datetime-local"
                  value={vm.period.endsAt}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium sm:col-span-2">
                Motivo (opcional)
                <Input
                  onChange={(event) => vm.setPeriod({ ...vm.period, reason: event.target.value })}
                  value={vm.period.reason}
                />
              </label>
            </div>
            <Button
              className="mt-5"
              disabled={vm.periodMutation.isPending || !vm.period.startsAt || !vm.period.endsAt}
              onClick={vm.submitPeriod}
              type="button"
            >
              {vm.periodMutation.isPending ? <LoaderCircle className="animate-spin" /> : <Clock3 />}
              Programar indisponibilidade
            </Button>
            {vm.periodMutation.isError ? (
              <p className="mt-3 text-sm text-destructive">
                Não foi possível criar o período. Confira as datas.
              </p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
