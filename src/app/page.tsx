'use client'
import { useQuery } from '@tanstack/react-query'
import { Loader2Icon } from 'lucide-react'
import {
  Fragment,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { z } from 'zod'
import { Elo } from '@/components/elo-icon'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { UserAvatar } from '@/components/user-avatar'
import { FaceitPlayerData } from '@/faceit-contracts'
import { toSteamId64 } from '@/lib/steamid'
import { RosterQueryData } from '@/services/challengermode.dto'

const DEFAULT_TOURNAMENT_ID =
  process.env.NODE_ENV === 'development'
    ? '9fb0e8d8-6733-49c5-3943-08dddfe5e858'
    : ''

async function fetchTournamentRoster(
  tournamentId: string
): Promise<RosterQueryData> {
  const response = await fetch(
    `/api/challengermode/roster?tournamentId=${tournamentId}`
  )

  return response.json()
}

async function fetchFaceitPlayers(
  ids: string[]
): Promise<Record<string, FaceitPlayerData | null>> {
  const searchParams = new URLSearchParams()
  for (const id of ids) {
    searchParams.append('id', id)
  }

  const response = await fetch(
    `https://faceit-elo.funclub.pro/?${searchParams.toString()}`
  )
  return response.json()
}

function validateTournamentId(tournamentId: unknown): tournamentId is string {
  return z.guid().safeParse(tournamentId).success
}

export default function HomePage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [tournamentId, setTournamentId] = useState<string>('')

  const {
    data: roster,
    isLoading: isRosterLoading,
    refetch: refetchTournament
  } = useQuery({
    queryKey: ['tournament', tournamentId],
    enabled: !!tournamentId,
    queryFn: () => fetchTournamentRoster(tournamentId)
  })

  const { mixedLineups, playerIds } = useMemo(() => {
    const mixedLineups = roster
      ? [
          ...roster.tournament.attendance.roster.lineups,
          ...roster.tournament.attendance.signups.lineups
        ]
      : []

    const playerIds = mixedLineups.flatMap((lineup) =>
      lineup.members.map((member) => toSteamId64(member.gameAccountId))
    )

    return { mixedLineups, playerIds }
  }, [roster])

  const {
    data: players,
    isLoading: isPlayersLoading,
    refetch: refetchPlayers
  } = useQuery({
    queryKey: ['player', playerIds],
    enabled: playerIds.length > 0,
    queryFn: () => fetchFaceitPlayers(playerIds)
  })

  useEffect(() => {
    const { searchParams } = new URL(location.href)
    const tournamentId = searchParams.get('tournamentId')

    if (searchParams.has('tournamentId')) {
      if (validateTournamentId(tournamentId)) {
        setTournamentId(tournamentId)
      }
    }
  }, [])

  const isRosterEmpty = !roster || isRosterLoading
  const isLoading = isRosterLoading || isPlayersLoading

  const {
    teamsCount,
    groupsCount,
    teamPlayersCount,
    groupPlayersCount,
    playersCount
  } = useMemo(() => {
    const teamsCount = isRosterEmpty
      ? 0
      : mixedLineups.reduce((acc, curr) => acc + Number(curr.team ? 1 : 0), 0)

    const groupsCount = isRosterEmpty
      ? 0
      : mixedLineups.reduce((acc, curr) => acc + Number(curr.team ? 0 : 1), 0)

    const teamPlayersCount = isRosterEmpty
      ? 0
      : mixedLineups.reduce(
          (acc, curr) => acc + Number(curr.team ? curr.members.length : 0),
          0
        )

    const groupPlayersCount = isRosterEmpty
      ? 0
      : mixedLineups.reduce(
          (acc, curr) => acc + Number(curr.team ? 0 : curr.members.length),
          0
        )

    const playersCount = isRosterEmpty
      ? 0
      : mixedLineups.reduce((acc, curr) => acc + curr.members.length, 0)

    return {
      teamsCount,
      groupsCount,
      teamPlayersCount,
      groupPlayersCount,
      playersCount
    }
  }, [isRosterEmpty, mixedLineups])

  const eloMap = useMemo(() => {
    if (!players) {
      return {}
    }

    const result: Record<string, number | null> = {}

    for (const [id, player] of Object.entries(players)) {
      if (!player) {
        result[id] = null
        continue
      }

      result[id] = player.games.cs2.faceit_elo
    }

    return result
  }, [players])

  function onSubmit() {
    const value = inputRef.current?.value || ''

    try {
      // Валидация
      z.union([z.guid(), z.url()]).parse(value)

      // Если это ID
      if (!value.startsWith('https')) {
        setTournamentId(value)
      } else {
        // https://www.challengermode.com/s/FUNCLUB/tournaments/9fb0e8d8-6733-49c5-3943-08dddfe5e858?tab=query
        const GUID_PATTERN =
          /(\{{0,1}([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}\}{0,1})/
        setTournamentId(value.match(GUID_PATTERN)![0])
      }

      refetchPlayers()
      refetchTournament()
    } catch {
      alert(`ID турнира невалиден`)
    }
  }

  return (
    <div className="flex flex-col gap-4 mx-auto py-5 container">
      <h1 className="font-semibold text-2xl">
        CS2 Challengermode Tournament FACEIT ELO Fetcher
      </h1>

      <Section
        title="Поиск турнира"
        description="Укажите ID или ссылку турнира чтобы начать поиск"
        className="flex gap-4"
      >
        <Input
          type="text"
          placeholder="Ваш запрос"
          defaultValue={DEFAULT_TOURNAMENT_ID}
          ref={inputRef}
        />

        <Button onClick={onSubmit}>Получить данные</Button>
      </Section>

      <Section title="Информация о турнире">
        {roster ? (
          <div className="flex flex-col gap-2">
            <div className="font-semibold text-sm">
              {roster.tournament.name}
            </div>
            <pre className="font-sans text-sm">
              {roster.tournament.description}
            </pre>
          </div>
        ) : (
          <div>Данных нет</div>
        )}
      </Section>

      {isLoading && (
        <Section title="Идёт загрузка">
          <Loader2Icon className="size-8 animate-spin" />

          <div className="mt-4 text-muted-foreground text-sm">
            Запрос игроков от FACEIT занимает очень много времени...
          </div>
        </Section>
      )}

      <Section title="Команды">
        <ul className="text-sm">
          <li>Количество команд: {teamsCount}</li>
          <li>Количество групп: {groupsCount}</li>
          <li>Итого: {mixedLineups.length}</li>
        </ul>

        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Тип</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Капитан</TableHead>
              <TableHead>Кол-во игроков</TableHead>
              <TableHead>
                <span className="flex flex-col">
                  <span>ELO</span>
                  <span className="text-muted-foreground text-xs">
                    MIN - MAX
                  </span>
                </span>
              </TableHead>
              <TableHead>
                <span className="flex flex-col">
                  <span>ELO</span>
                  <span className="text-muted-foreground text-xs">Среднее</span>
                </span>
              </TableHead>
              <TableHead>
                <span className="flex flex-col">
                  <span>ELO</span>
                  <span className="text-muted-foreground text-xs">Сумма</span>
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isRosterEmpty ? (
              <TableRow>
                <TableCell colSpan={6}>Данных нет</TableCell>
              </TableRow>
            ) : (
              mixedLineups.map((lineup) => {
                let lowest = Number.MAX_VALUE
                let highest = Number.MIN_VALUE
                let total = 0

                for (const member of lineup.members) {
                  const elo = eloMap[toSteamId64(member.gameAccountId)]

                  if (!elo) {
                    continue
                  }

                  lowest = Math.min(lowest, Math.floor(elo))
                  highest = Math.max(highest, Math.floor(elo))
                  total += Math.floor(elo)
                }

                const captain = lineup.members.find((member) => member.captain)!

                return (
                  <TableRow key={lineup.name}>
                    <TableCell>{lineup.team ? 'Команда' : 'Группа'}</TableCell>
                    <TableCell>{lineup.name}</TableCell>
                    <TableCell className="flex items-center gap-1.5">
                      <UserAvatar member={captain} />
                      {captain.user.username}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {lineup.members.length}/8
                    </TableCell>
                    <TableCell className="tabular-nums">
                      <span className="grid grid-cols-2 max-w-56">
                        <span className="flex items-center gap-1.5">
                          <Elo className="size-6" elo={lowest} /> {lowest}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Elo className="size-6" elo={highest} /> {highest}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {Math.floor(total / lineup.members.length)}
                    </TableCell>
                    <TableCell className="tabular-nums">{total}</TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Section>

      <Section title="Игроки">
        <ul className="text-sm">
          <li>Количество игроков в командах: {teamPlayersCount}</li>
          <li>Количество игроков в группах: {groupPlayersCount}</li>
          <li>Итого: {playersCount}</li>
        </ul>

        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Команда</TableHead>
              <TableHead>Игрок</TableHead>
              <TableHead>Steam ID</TableHead>
              <TableHead>ELO</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isRosterEmpty ? (
              <TableRow>
                <TableCell colSpan={4}>Данных нет</TableCell>
              </TableRow>
            ) : (
              mixedLineups.map((lineup) => {
                const members = lineup.members.map((member) => {
                  const id64 = toSteamId64(member.gameAccountId)

                  return (
                    <TableRow key={`${lineup.name}::${member.gameAccountId}`}>
                      <TableCell />
                      <TableCell className="inline-flex gap-1.5">
                        <UserAvatar member={member} />
                        {member.user.username}{' '}
                        {member.captain && (
                          <span className="font-medium">(капитан)</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <a
                          className="tabular-nums text-blue-300 underline"
                          href={`https://steamcommunity.com/profiles/${id64}`}
                          target="_blank"
                        >
                          {id64}
                        </a>
                      </TableCell>
                      <TableCell>
                        {eloMap[id64] ? (
                          <span className="flex items-center gap-0.5 tabular-nums">
                            <Elo className="size-6" elo={eloMap[id64] ?? 0} />
                            {eloMap[id64]}
                          </span>
                        ) : (
                          <span className="font-bold">Не найден</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })

                return (
                  <Fragment key={lineup.name}>
                    <TableRow>
                      <TableCell className="font-bold" colSpan={4}>
                        {lineup.name}
                      </TableCell>
                    </TableRow>

                    {members}
                  </Fragment>
                )
              })
            )}
          </TableBody>
        </Table>
      </Section>
    </div>
  )
}

function Section({
  title,
  description,
  className,
  children
}: {
  title?: string
  description?: string
  className?: string
  children: ReactNode
}) {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={className}>{children}</CardContent>
    </Card>
  )
}
