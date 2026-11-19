from manim import *


class DerivativeTangent(Scene):
    def construct(self):
        self.camera.background_color = '#101c2b'

        title = Text('Derivative: approaching the tangent', font_size=34)
        title.to_edge(UP)

        axes = Axes(
            x_range=[0, 3.5, 1],
            y_range=[0, 12, 2],
            x_length=8.2,
            y_length=4.5,
            tips=False,
            axis_config={'color': GREY_B},
        ).shift(DOWN * 0.15)
        labels = axes.get_axis_labels(
            x_label=Text('time', font_size=24),
            y_label=Text('distance', font_size=24),
        )
        graph = axes.plot(lambda x: x * x, x_range=[0, 3.4], color=BLUE_C)

        fixed_time = 1.5
        fixed_distance = fixed_time ** 2
        h = ValueTracker(1.2)
        first = Dot(axes.c2p(fixed_time, fixed_distance), color=WHITE)
        second = always_redraw(lambda: Dot(
            axes.c2p(fixed_time + h.get_value(), (fixed_time + h.get_value()) ** 2),
            color=ORANGE,
        ))

        secant = always_redraw(lambda: Line(
            axes.c2p(fixed_time - 0.65, fixed_distance - 0.65 * (3 + h.get_value())),
            axes.c2p(fixed_time + 0.95, fixed_distance + 0.95 * (3 + h.get_value())),
            color=YELLOW,
            stroke_width=4,
        ))
        tangent = Line(
            axes.c2p(0.85, fixed_distance - 0.65 * 3),
            axes.c2p(2.45, fixed_distance + 0.95 * 3),
            color=GREEN_C,
            stroke_width=3,
        )

        slope_label = Text('Secant slope:', font_size=24).to_edge(DOWN).shift(LEFT * 0.6)
        slope_value = Text('4.20', font_size=27, color=YELLOW)
        slope_value.next_to(slope_label, RIGHT)

        def update_slope(value):
            number = Text(f'{3 + h.get_value():.2f}', font_size=27, color=YELLOW)
            value.become(number.next_to(slope_label, RIGHT))

        slope_value.add_updater(update_slope)
        note = Text('At t = 1.5, the tangent slope is 3', font_size=22, color=GREEN_C)
        note.next_to(title, DOWN, buff=0.2)

        self.play(Write(title), Create(axes), Write(labels), Create(graph), run_time=2)
        self.add(first, second, secant, slope_label, slope_value)
        self.play(h.animate.set_value(0.05), run_time=5, rate_func=linear)
        self.play(Create(tangent), FadeIn(note), run_time=1.2)
        self.wait(1.2)
