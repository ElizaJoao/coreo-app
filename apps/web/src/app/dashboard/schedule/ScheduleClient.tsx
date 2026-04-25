"use client";

import { useState, useEffect, useCallback } from "react";
import type { Choreography } from "../../../types/choreography";
import type { ClassSchedule, ClassAssignment } from "../../../types/schedule";
import styles from "./ScheduleClient.module.css";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;
const SLOT_COLORS = ["#e85d5d","#5d9be8","#5de87a","#e8c45d","#c45de8","#5de8d4"] as const;
const DEFAULT_COLOR = "#e8c45d";

function getWeekStart(offset: number): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon + offset * 7);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function fmtDayDate(date: Date): string {
  return `${DAY_NAMES[(date.getDay() + 6) % 7]} ${date.getDate()}`;
}

function fmt12(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function assignmentKey(scheduleId: string, date: string): string {
  return `${scheduleId}_${date}`;
}

type AddFormState = {
  title: string;
  style: string;
  dayOfWeek: number;
  timeOfDay: string;
  durationMin: number;
  location: string;
  color: string;
};

type Props = {
  initialSchedules: ClassSchedule[];
  choreographies: Choreography[];
};

export function ScheduleClient({ initialSchedules, choreographies }: Props) {
  const [schedules, setSchedules] = useState<ClassSchedule[]>(initialSchedules);
  const [assignments, setAssignments] = useState<Map<string, ClassAssignment>>(new Map());
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<AddFormState>({
    title: "",
    style: "",
    dayOfWeek: 0,
    timeOfDay: "09:00",
    durationMin: 60,
    location: "",
    color: DEFAULT_COLOR,
  });
  const [addSaving, setAddSaving] = useState(false);
  const [pinSlot, setPinSlot] = useState<{ scheduleId: string; date: string } | null>(null);

  const weekStart = getWeekStart(weekOffset);
  const weekEnd = addDays(weekStart, 6);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const todayStr = isoDate(new Date());

  const weekLabel = (() => {
    const s = weekStart;
    const e = weekEnd;
    const sameMonth = s.getMonth() === e.getMonth();
    if (sameMonth) return `${MONTH_NAMES[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
    return `${MONTH_NAMES[s.getMonth()]} ${s.getDate()} – ${MONTH_NAMES[e.getMonth()]} ${e.getDate()}, ${s.getFullYear()}`;
  })();

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/schedule/assignments?weekStart=${isoDate(weekStart)}&weekEnd=${isoDate(weekEnd)}`,
      );
      if (!res.ok) return;
      const data: ClassAssignment[] = await res.json();
      const map = new Map<string, ClassAssignment>();
      for (const a of data) map.set(assignmentKey(a.scheduleId, a.assignedDate), a);
      setAssignments(map);
    } catch {
      // network error — leave existing assignments
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  function openAddModal(dayOfWeek: number) {
    setAddForm({ title: "", style: "", dayOfWeek, timeOfDay: "09:00", durationMin: 60, location: "", color: DEFAULT_COLOR });
    setShowAddModal(true);
  }

  async function handleAddSchedule() {
    if (!addForm.title.trim()) return;
    setAddSaving(true);
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      if (!res.ok) return;
      const schedule: ClassSchedule = await res.json();
      setSchedules((prev) =>
        [...prev, schedule].sort(
          (a, b) => a.dayOfWeek - b.dayOfWeek || a.timeOfDay.localeCompare(b.timeOfDay),
        ),
      );
      setShowAddModal(false);
    } finally {
      setAddSaving(false);
    }
  }

  function handleRemoveSchedule(id: string) {
    // Optimistic: remove immediately
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    setAssignments((prev) => {
      const next = new Map(prev);
      for (const key of Array.from(next.keys())) {
        if (key.startsWith(`${id}_`)) next.delete(key);
      }
      return next;
    });
    fetch(`/api/schedule/${id}`, { method: "DELETE" });
  }

  function handlePinChoreo(scheduleId: string, date: string, choreographyId: string) {
    setPinSlot(null);
    // Optimistic: show assignment immediately with a temp ID
    const optimistic: ClassAssignment = {
      id: `tmp_${Date.now()}`,
      userId: "",
      scheduleId,
      assignedDate: date,
      choreographyId,
      notes: "",
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };
    const key = assignmentKey(scheduleId, date);
    setAssignments((prev) => new Map(prev).set(key, optimistic));
    // Confirm with server and replace temp with real record
    fetch("/api/schedule/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduleId, assignedDate: date, choreographyId }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((assignment: ClassAssignment | null) => {
        if (assignment) {
          setAssignments((prev) => new Map(prev).set(key, assignment));
        } else {
          // Rollback on failure
          setAssignments((prev) => {
            const next = new Map(prev);
            next.delete(key);
            return next;
          });
        }
      });
  }

  function handleUnpin(scheduleId: string, date: string) {
    const key = assignmentKey(scheduleId, date);
    const assignment = assignments.get(key);
    if (!assignment) return;
    // Optimistic: remove immediately
    setAssignments((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
    fetch(`/api/schedule/assignments/${assignment.id}`, { method: "DELETE" }).catch(() => {
      // Rollback on failure
      setAssignments((prev) => new Map(prev).set(key, assignment));
    });
  }

  const checklistItems = weekDates.flatMap((date, dayIdx) => {
    const daySchedules = schedules.filter((s) => s.dayOfWeek === dayIdx);
    return daySchedules.map((s) => {
      const dateStr = isoDate(date);
      const assignment = assignments.get(assignmentKey(s.id, dateStr));
      return { schedule: s, date, dateStr, assignment };
    });
  });

  const assignedCount = checklistItems.filter((item) => item.assignment?.choreographyId).length;

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Schedule</h1>
          <div className={styles.weekNav}>
            <button className={styles.navBtn} onClick={() => setWeekOffset((o) => o - 1)}>‹</button>
            <span className={styles.weekLabel}>{weekLabel}</span>
            <button className={styles.navBtn} onClick={() => setWeekOffset((o) => o + 1)}>›</button>
            {weekOffset !== 0 && (
              <button className={styles.todayBtn} onClick={() => setWeekOffset(0)}>Today</button>
            )}
          </div>
        </div>
        <button
          className={styles.addClassBtn}
          onClick={() => openAddModal((new Date().getDay() + 6) % 7)}
        >
          + Add Class
        </button>
      </div>

      <div className={styles.body}>
        {/* Week grid */}
        <div className={styles.weekGrid}>
          {weekDates.map((date, dayIdx) => {
            const dateStr = isoDate(date);
            const isToday = dateStr === todayStr;
            const daySchedules = schedules.filter((s) => s.dayOfWeek === dayIdx);

            return (
              <div key={dayIdx} className={`${styles.dayCol} ${isToday ? styles.dayColToday : ""}`}>
                <div className={styles.dayHead}>
                  <span className={styles.dayName}>{DAY_NAMES[dayIdx]}</span>
                  <span className={`${styles.dayNum} ${isToday ? styles.dayNumToday : ""}`}>
                    {date.getDate()}
                  </span>
                </div>

                <div className={styles.daySlots}>
                  {daySchedules.length === 0 && (
                    <div className={styles.emptyDay}>No classes</div>
                  )}
                  {daySchedules.map((sched) => {
                    const key = assignmentKey(sched.id, dateStr);
                    const assignment = assignments.get(key);
                    const assignedChoreo = assignment?.choreographyId
                      ? choreographies.find((c) => c.id === assignment.choreographyId)
                      : null;
                    const isPinOpen = pinSlot?.scheduleId === sched.id && pinSlot?.date === dateStr;
                    const styleMatches = sched.style
                      ? choreographies.filter(
                          (c) => c.style.toLowerCase() === sched.style.toLowerCase(),
                        )
                      : [];
                    const otherChoreos = choreographies.filter((c) => !styleMatches.includes(c));

                    return (
                      <div
                        key={sched.id}
                        className={styles.slotCard}
                        style={{ borderLeftColor: sched.color }}
                      >
                        <div className={styles.slotTop}>
                          <span className={styles.slotTime}>{fmt12(sched.timeOfDay)}</span>
                          <button
                            className={styles.slotRemove}
                            onClick={() => handleRemoveSchedule(sched.id)}
                            title="Remove recurring class"
                          >
                            ×
                          </button>
                        </div>
                        <div className={styles.slotTitle}>{sched.title}</div>
                        <div className={styles.slotMeta}>
                          {sched.durationMin} min
                          {sched.style ? ` · ${sched.style}` : ""}
                          {sched.location ? ` · ${sched.location}` : ""}
                        </div>

                        {assignedChoreo ? (
                          <div className={styles.choreoPill}>
                            <span className={styles.choreoName}>{assignedChoreo.name}</span>
                            <button
                              className={styles.choreoUnpin}
                              onClick={() => handleUnpin(sched.id, dateStr)}
                              title="Unpin choreography"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className={styles.pinArea}>
                            <button
                              className={styles.pinBtn}
                              onClick={() =>
                                setPinSlot(isPinOpen ? null : { scheduleId: sched.id, date: dateStr })
                              }
                            >
                              {isPinOpen ? "Cancel" : "Pin choreo ▾"}
                            </button>
                            {isPinOpen && (
                              <div className={styles.pinDropdown}>
                                {choreographies.length === 0 ? (
                                  <div className={styles.pinEmpty}>No choreographies yet</div>
                                ) : (
                                  <>
                                    {styleMatches.length > 0 && (
                                      <div className={styles.pinGroup}>
                                        <div className={styles.pinGroupLabel}>
                                          Matching — {sched.style}
                                        </div>
                                        {styleMatches.slice(0, 6).map((c) => (
                                          <button
                                            key={c.id}
                                            className={styles.pinOption}
                                            onClick={() => handlePinChoreo(sched.id, dateStr, c.id)}
                                          >
                                            <span className={styles.pinOptionName}>{c.name}</span>
                                            <span className={styles.pinOptionMeta}>{c.duration} min</span>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                    {otherChoreos.length > 0 && (
                                      <div className={styles.pinGroup}>
                                        {styleMatches.length > 0 && (
                                          <div className={styles.pinGroupLabel}>Others</div>
                                        )}
                                        {otherChoreos.slice(0, 6).map((c) => (
                                          <button
                                            key={c.id}
                                            className={styles.pinOption}
                                            onClick={() => handlePinChoreo(sched.id, dateStr, c.id)}
                                          >
                                            <span className={styles.pinOptionName}>{c.name}</span>
                                            <span className={styles.pinOptionMeta}>
                                              {c.style} · {c.duration} min
                                            </span>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  className={styles.addSlotBtn}
                  onClick={() => openAddModal(dayIdx)}
                >
                  + Add
                </button>
              </div>
            );
          })}
        </div>

        {/* Prep checklist sidebar */}
        <aside className={styles.checklist}>
          <div className={styles.checklistHead}>
            <span className={styles.checklistTitle}>WEEK PREP</span>
            {checklistItems.length > 0 && (
              <span className={styles.checklistProg}>
                {assignedCount}/{checklistItems.length}
              </span>
            )}
          </div>

          {checklistItems.length === 0 ? (
            <div className={styles.checklistEmpty}>
              Add recurring classes to the week view to build your prep checklist.
            </div>
          ) : (
            <div className={styles.checklistList}>
              {checklistItems.map(({ schedule, date, dateStr, assignment }, idx) => {
                const prevItem = idx > 0 ? checklistItems[idx - 1] : null;
                const showDayLabel = !prevItem || isoDate(prevItem.date) !== dateStr;
                const assignedChoreo = assignment?.choreographyId
                  ? choreographies.find((c) => c.id === assignment.choreographyId)
                  : null;
                const ready = !!assignedChoreo;

                return (
                  <div key={`${schedule.id}_${dateStr}`}>
                    {showDayLabel && (
                      <div className={styles.checklistDay}>{fmtDayDate(date)}</div>
                    )}
                    <div className={`${styles.checklistItem} ${ready ? styles.checklistItemDone : ""}`}>
                      <div
                        className={styles.checklistDot}
                        style={{ background: ready ? "var(--accent)" : "var(--border-3)" }}
                      />
                      <div className={styles.checklistInfo}>
                        <div className={styles.checklistClass}>
                          <span style={{ color: schedule.color, fontSize: 8 }}>●</span>{" "}
                          {fmt12(schedule.timeOfDay)} · {schedule.title}
                        </div>
                        {assignedChoreo ? (
                          <div className={styles.checklistChoreo}>{assignedChoreo.name}</div>
                        ) : (
                          <div className={styles.checklistNeed}>Needs choreography</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      </div>

      {/* Add Class Modal */}
      {showAddModal && (
        <div
          className={styles.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <span className={styles.modalTitle}>Add Recurring Class</span>
              <button className={styles.modalClose} onClick={() => setShowAddModal(false)}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Class title</label>
                <input
                  className={styles.fieldInput}
                  value={addForm.title}
                  onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Morning Zumba"
                  autoFocus
                />
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Style</label>
                  <input
                    className={styles.fieldInput}
                    value={addForm.style}
                    onChange={(e) => setAddForm((f) => ({ ...f, style: e.target.value }))}
                    placeholder="e.g. Zumba"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Location</label>
                  <input
                    className={styles.fieldInput}
                    value={addForm.location}
                    onChange={(e) => setAddForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. Studio A"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Day of week</label>
                <div className={styles.dayPicker}>
                  {DAY_NAMES.map((day, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`${styles.dayPickerBtn} ${addForm.dayOfWeek === i ? styles.dayPickerBtnActive : ""}`}
                      onClick={() => setAddForm((f) => ({ ...f, dayOfWeek: i }))}
                    >
                      {day.slice(0, 2)}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Start time</label>
                  <input
                    type="time"
                    className={styles.fieldInput}
                    value={addForm.timeOfDay}
                    onChange={(e) => setAddForm((f) => ({ ...f, timeOfDay: e.target.value }))}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Duration</label>
                  <select
                    className={styles.fieldSelect}
                    value={addForm.durationMin}
                    onChange={(e) => setAddForm((f) => ({ ...f, durationMin: Number(e.target.value) }))}
                  >
                    {[30, 45, 60, 75, 90, 120].map((d) => (
                      <option key={d} value={d}>{d} min</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Color</label>
                <div className={styles.colorPicker}>
                  {SLOT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`${styles.colorSwatch} ${addForm.color === c ? styles.colorSwatchActive : ""}`}
                      style={{ background: c }}
                      onClick={() => setAddForm((f) => ({ ...f, color: c }))}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.modalFoot}>
              <button className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleAddSchedule}
                disabled={!addForm.title.trim() || addSaving}
              >
                {addSaving ? "Saving…" : "Add Class"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
