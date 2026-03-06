package com.oneyear

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import java.util.Calendar

/**
 * YearProgressWidget
 *
 * Android home-screen widget that shows the current year's progress.
 * Reads data purely from the Calendar — no dependency on the RN bundle at update time.
 * Tapping the widget opens the main app.
 */
class YearProgressWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        for (widgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, widgetId)
        }
    }

    companion object {
        fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, widgetId: Int) {
            val views = RemoteViews(context.packageName, R.layout.widget_year_progress)

            // ── Date computation ──
            val now = Calendar.getInstance()
            val year = now.get(Calendar.YEAR)
            val dayOfYear = now.get(Calendar.DAY_OF_YEAR)
            val totalDays = if (isLeapYear(year)) 366 else 365
            val daysLeft = totalDays - dayOfYear
            val percent = (dayOfYear.toFloat() / totalDays.toFloat() * 100f)
            val percentStr = "%.1f%%".format(percent)
            val progressInt = percent.toInt()

            // ── Bind to views ──
            views.setTextViewText(R.id.widget_year, year.toString())
            views.setTextViewText(R.id.widget_percent, percentStr)
            views.setTextViewText(R.id.widget_day_gone, "Day $dayOfYear")
            views.setTextViewText(R.id.widget_day_left, "$daysLeft days left")
            views.setProgressBar(R.id.widget_progress_bar, 100, progressInt, false)

            // ── Tap → open app ──
            val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            if (launchIntent != null) {
                val pendingIntent = PendingIntent.getActivity(
                    context, 0, launchIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
                )
                views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)
            }

            appWidgetManager.updateAppWidget(widgetId, views)
        }

        private fun isLeapYear(year: Int): Boolean =
            (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)
    }
}
