"use client";

import * as React from "react";
import { Badge, Button, SegmentedControl, Slider, Switch } from "@kineticui/ui";
import { NumberTicker } from "@kineticui/motion";

/** Usage-based price estimator: seats and volume sliders, add-ons and billing period with a live total. */
export function PricingCalculator() {
  const [seats, setSeats] = React.useState(12);
  const [events, setEvents] = React.useState(250);
  const [sso, setSso] = React.useState(false);
  const [support, setSupport] = React.useState(true);
  const [period, setPeriod] = React.useState("yearly");
  const perSeat = seats > 50 ? 14 : seats > 20 ? 17 : 20;
  const volume = Math.max(0, events - 100) * 0.08;
  const monthly = seats * perSeat + volume + (sso ? 99 : 0) + (support ? 49 : 0);
  const total = Math.round(period === "yearly" ? monthly * 0.8 : monthly);

  return (
    <section className="flex min-h-[620px] items-center justify-center p-6">
      <div className="grid w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-surface md:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-7 p-7">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Estimate your plan</h2>
            <p className="mt-1 text-sm text-muted">Pay for what you use. Volume discounts apply automatically.</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-sm"><span>Team seats</span><span className="font-mono">{seats}</span></div>
            <Slider min={1} max={100} value={[seats]} onValueChange={(v) => setSeats(v[0]!)} aria-label="Team seats" />
            <span className="text-xs text-subtle">${perSeat}/seat{seats > 20 ? " · volume discount applied" : ""}</span>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-sm"><span>Events per month</span><span className="font-mono">{events}k</span></div>
            <Slider min={10} max={2000} step={10} value={[events]} onValueChange={(v) => setEvents(v[0]!)} aria-label="Events per month" />
            <span className="text-xs text-subtle">First 100k included</span>
          </div>
          <div className="flex flex-col gap-3">
            <Switch checked={sso} onCheckedChange={setSso} label="SAML SSO" description="+$99 / month" />
            <Switch checked={support} onCheckedChange={setSupport} label="Priority support" description="+$49 / month" />
          </div>
        </div>
        <div className="flex flex-col justify-between gap-6 border-t border-border bg-surface-raised p-7 md:border-l md:border-t-0">
          <SegmentedControl value={period} defaultValue="yearly" onValueChange={setPeriod} options={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly −20%" }]} />
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted">Estimated total</span>
            <span className="font-display text-6xl font-semibold tabular-nums tracking-tight">
              <NumberTicker value={total} prefix="$" duration={0.5} />
            </span>
            <span className="text-sm text-subtle">per month{period === "yearly" ? `, $${(total * 12).toLocaleString("en-US")} billed yearly` : ""}</span>
          </div>
          <ul className="flex flex-col gap-1.5 text-xs text-muted">
            <li className="flex justify-between"><span>{seats} seats × ${perSeat}</span><span className="font-mono">${seats * perSeat}</span></li>
            <li className="flex justify-between"><span>Extra events</span><span className="font-mono">${Math.round(volume)}</span></li>
            {sso ? <li className="flex justify-between"><span>SSO</span><span className="font-mono">$99</span></li> : null}
            {support ? <li className="flex justify-between"><span>Priority support</span><span className="font-mono">$49</span></li> : null}
          </ul>
          <div className="flex flex-col gap-2">
            <Button size="lg">Start with this plan</Button>
            {seats > 50 ? <Badge variant="soft" className="self-center">Over 50 seats? Talk to sales for a custom quote</Badge> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
