import { useMemo, useState } from 'react'
import './App.css'
import { BudgetRoutes } from './components/BudgetRoutes'
import { CardGrid } from './components/CardGrid'
import { Checklist } from './components/Checklist'
import { Conclusion } from './components/Conclusion'
import { Disclaimer } from './components/Disclaimer'
import { FilterBar } from './components/FilterBar'
import { GoalRoutes } from './components/GoalRoutes'
import { Hero } from './components/Hero'
import { OverviewTable } from './components/OverviewTable'
import { SourcesFooter } from './components/SourcesFooter'
import { Starfield } from './components/Starfield'
import { TrainingSafetyDetails } from './components/TrainingSafetyDetails'
import { SPACE_OPTIONS } from './data/spaceOptions'
import {
  EMPTY_FILTERS,
  filterOptions,
  toggleFilterValue,
  type FilterDimension,
} from './features/filters/filterOptions'

function App() {
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS)
  const filteredOptions = useMemo(
    () => filterOptions(SPACE_OPTIONS, activeFilters),
    [activeFilters],
  )

  const handleToggle = (dimension: FilterDimension, value: string): void => {
    setActiveFilters((current) => toggleFilterValue(current, dimension, value))
  }

  const handleClear = (): void => {
    setActiveFilters(EMPTY_FILTERS)
  }

  return (
    <>
      <Starfield />
      <Hero />
      <main>
        <Disclaimer />
        <OverviewTable />
        <FilterBar
          activeFilters={activeFilters}
          onToggle={handleToggle}
          onClear={handleClear}
        />
        <CardGrid options={filteredOptions} total={SPACE_OPTIONS.length} />
        <BudgetRoutes />
        <GoalRoutes />
        <TrainingSafetyDetails />
        <Checklist />
        <Conclusion />
      </main>
      <SourcesFooter />
    </>
  )
}

export default App
