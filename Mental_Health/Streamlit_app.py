import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

st.set_page_config(layout="wide", page_title="Mental Health Analytics", page_icon="🧠")

# Custom CSS Theme
st.markdown(
<style>
.block-container {
 padding: 1rem 2rem;
}
.st-bx { background-color: transparent; }
.st-cs { background-color: transparent; }
</style>
, unsafe_allow_html=True)

# Sidebar Navigation
st.sidebar.title("🔍 Navigation")
page = st.sidebar.radio("Go to", ["Overview", "Gender Analysis", "Mental Health Patterns", "Stress Trends"])

# Sidebar Metrics
st.sidebar.markdown("---")
st.sidebar.metric("Total Respondents", "290,000+")
st.sidebar.metric("Countries", "35+")

# Overview Page
if page == "Overview":
    st.title("🧠 Mental Health Dashboard - Overview")
    col1, col2, col3 = st.columns(3)
    col1.metric("Students", "61470")
    col2.metric("Self-employed", "29168")
    col3.metric("Employed", "256434")

    st.markdown("---")

    st.subheader("Occupation Distribution")
    view_option = st.radio("Choose View", ["Bar Chart", "Pie Chart"], horizontal=True)

    # <<< IMPORTANT: Make sure variables are outside the if blocks >>>
    occupations = ["Students", "Self-employed", "Employed"]
    occupation_counts = [61470, 29168, 256434]

    if view_option == "Bar Chart":
        fig = go.Figure(data=[
            go.Bar(
                x=[0, 1, 2],  # Numeric positions
                y=occupation_counts,
                marker_color=['rgb(65, 94, 114)', 'rgb(197, 176, 205)', 'rgb(23, 49, 62)']
            )
        ])

        fig.update_layout(
            xaxis=dict(
                tickmode='array',
                tickvals=[0, 1, 2],
                ticktext=occupations
            ),
            yaxis_title="",
            bargap=0.4,
            showlegend=False
        )

        st.plotly_chart(fig, use_container_width=True)

    else:
        fig7 = px.pie(
            names=occupations,
            values=occupation_counts,
            color_discrete_sequence=['rgb(65, 94, 114)', 'rgb(197, 176, 205)', 'rgb(23, 49, 62)']
        )
        st.plotly_chart(fig7, use_container_width=True)



# Gender Analysis Page
elif page == "Gender Analysis":
    st.title("👫 Gender Gap in Mental Health")

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Growing Stress Rate & Treatment Acceptance Rate")

        categories = ['Male', 'Female']
        stress_rates = [30, 41.45]
        treatment_rates = [45, 69.42]

        fig3 = go.Figure(data=[
            go.Bar(
                name='Stress Rate',
                x=categories,
                y=stress_rates,
                marker_color='rgb(65, 94, 114)'
            ),
            go.Bar(
                name='Treatment Acceptance',
                x=categories,
                y=treatment_rates,
                marker_color='rgb(197, 176, 205)'
            )
        ])

        fig3.update_layout(
            barmode='group',
            yaxis_title='Percentage (%)',
            bargap=0.4
        )

        st.plotly_chart(fig3, use_container_width=True)
    with col2:
        st.subheader("Gender Distribution")
        gender_labels = ['Male', 'Female']
        gender_values = [81.9, 18.1]
        fig4 = px.pie(names=gender_labels, values=gender_values,
                      color_discrete_sequence=['rgb(197, 176, 205)', 'rgb(65, 94, 114)'])
        st.plotly_chart(fig4, use_container_width=True)

# Mental Health Patterns Page
elif page == "Mental Health Patterns":
    st.title("🏢 Mental Health Patterns")
    st.subheader("Care Options by Occupation")

    occupations = ['Students', 'Self-employed', 'Employed']
    care_options = [32.86, 40.72, 32.02]

    fig5 = go.Figure(data=[
        go.Bar(
            x=[0, 1, 2],  # Numeric positions for even spacing
            y=care_options,
            marker_color=['rgb(65, 94, 114)', 'rgb(197, 176, 205)', 'rgb(23, 49, 62)']
        )
    ])

    fig5.update_layout(
        xaxis=dict(
            tickmode='array',
            tickvals=[0, 1, 2],
            ticktext=occupations
        ),
        yaxis_title="",
        bargap=0.4,
        showlegend=False
    )

    st.plotly_chart(fig5, use_container_width=True)

    st.markdown("---")
    st.subheader("Family History on Severe Mood Swings")
    occupations = ['Students', 'Self-employed', 'Employed']
    family_history = [16.45, 1, 12.83]

    fig_family = go.Figure(data=[
        go.Bar(
            x=[0, 1, 2],  # Numeric positions for equal spacing
            y=family_history,
            marker_color=['rgb(65, 94, 114)', 'rgb(197, 176, 205)', 'rgb(23, 49, 62)']
        )
    ])

    fig_family.update_layout(
        title="Impact of Family History on Severe Mood Swings",
        xaxis=dict(
            tickmode='array',
            tickvals=[0, 1, 2],
            ticktext=occupations
        ),
        yaxis_title="Percentage (%)",
        bargap=0.4,
        showlegend=False
    )

    st.plotly_chart(fig_family, use_container_width=True)
    # Stress Trends Page
elif page == "Stress Trends":
    st.title("📈 Stress Trends Over Time")

    st.subheader("Mood Swings vs Social Weakness Comparison")
    mood_weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    mood_percentages = [30, 35, 32, 33]
    social_percentages = [31, 31.5, 32, 31.7]

    df = pd.DataFrame({
        'Week': mood_weeks,
        'High Mood Swings (%)': mood_percentages,
        'Social Weakness (%)': social_percentages
    })

    fig8 = px.line(df, x='Week', y=['High Mood Swings (%)', 'Social Weakness (%)'],
                   color_discrete_sequence=['rgb(65, 94, 114)', 'rgb(197, 176, 205)'])
    fig8.update_traces(mode='lines+markers')
    fig8.update_layout(legend_title_text='Metric', legend=dict(itemsizing='constant'))
    st.plotly_chart(fig8, use_container_width=True)

    st.markdown("---")
    st.subheader("Interactive Growing Stress")
    stress_week = st.slider("Select Week", 1, 4, 1)
    stress_values_over_time = [25, 35, 45, 40]
    st.write(f"Selected Week {stress_week}: {stress_values_over_time[stress_week-1]}% Growing Stress")
    fig9 = px.bar(x=['Growing Stress'], y=[stress_values_over_time[stress_week-1]],
                  color_discrete_sequence=['rgb(197, 176, 205)'])
    fig9.update_layout(yaxis_range=[0,100])
    st.plotly_chart(fig9, use_container_width=True)
