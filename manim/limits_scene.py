from manim import *


class LimitsApproach(Scene):
    def construct(self):
        self.camera.background_color = '#14212d'
        title = Text('What does a limit mean?', font_size=36, color=WHITE).to_edge(UP)
        subtitle = Text('Move toward x = 2 from both directions', font_size=24, color=GREY_A).next_to(title, DOWN)
        axes = Axes(
            x_range=[0, 4, 1], y_range=[0, 11, 2],
            x_length=7.6, y_length=4.4, tips=False,
            axis_config={'color': GREY_B, 'include_numbers': False},
        ).shift(DOWN * 0.45)
        target = DashedLine(axes.c2p(2, 0), axes.c2p(2, 10), color=GREY_C, dash_length=0.1)
        left_color, right_color = BLUE_C, ORANGE
        self.play(FadeIn(title), FadeIn(subtitle), Create(axes), Create(target))

        gap = ValueTracker(0.85)

        def show_points(left_function, right_function):
            left = always_redraw(lambda: Dot(axes.c2p(2-gap.get_value(), left_function(2-gap.get_value())), color=left_color, radius=0.11))
            right = always_redraw(lambda: Dot(axes.c2p(2+gap.get_value(), right_function(2+gap.get_value())), color=right_color, radius=0.11))
            return left, right

        curve = axes.plot(lambda x: x*x, x_range=[0.3, 3.2], color=TEAL_C)
        filled = Dot(axes.c2p(2, 4), color=TEAL_C)
        left, right = show_points(lambda x: x*x, lambda x: x*x)
        self.play(Create(curve), FadeIn(filled), FadeIn(left), FadeIn(right))
        self.play(gap.animate.set_value(0.02), run_time=4, rate_func=smooth)
        conclusion = Text('Both sides approach 4', font_size=27, color=GREEN_C).to_edge(DOWN)
        self.play(Write(conclusion))
        self.wait(1)
        self.play(FadeOut(curve), FadeOut(filled), FadeOut(left), FadeOut(right), FadeOut(conclusion))

        gap.set_value(0.85)
        line_left = axes.plot(lambda x: x+2, x_range=[0.3, 1.998], color=TEAL_C)
        line_right = axes.plot(lambda x: x+2, x_range=[2.002, 3.5], color=TEAL_C)
        hole = Circle(radius=0.11, color=TEAL_C, stroke_width=3).move_to(axes.c2p(2, 4)).set_fill('#14212d', opacity=1)
        left, right = show_points(lambda x: x+2, lambda x: x+2)
        self.play(Create(line_left), Create(line_right), FadeIn(hole), FadeIn(left), FadeIn(right))
        hole_message = Text('Even with a hole, the limit is 4', font_size=27, color=GREEN_C).to_edge(DOWN)
        self.play(gap.animate.set_value(0.02), run_time=4)
        self.play(Write(hole_message))
        self.wait(1)
        self.play(FadeOut(line_left), FadeOut(line_right), FadeOut(hole), FadeOut(left), FadeOut(right), FadeOut(hole_message))

        gap.set_value(0.85)
        jump_left = axes.plot(lambda x: 1, x_range=[0.3, 1.998], color=TEAL_C)
        jump_right = axes.plot(lambda x: 4, x_range=[2, 3.5], color=TEAL_C)
        open_left = Circle(radius=0.11, color=TEAL_C, stroke_width=3).move_to(axes.c2p(2, 1)).set_fill('#14212d', opacity=1)
        close_right = Dot(axes.c2p(2, 4), color=TEAL_C, radius=0.1)
        left, right = show_points(lambda x: 1, lambda x: 4)
        self.play(Create(jump_left), Create(jump_right), FadeIn(open_left), FadeIn(close_right), FadeIn(left), FadeIn(right))
        self.play(gap.animate.set_value(0.02), run_time=4)
        jump_message = Text('1 from the left, 4 from the right: DNE', font_size=24, color=YELLOW_C).to_edge(DOWN)
        self.play(Write(jump_message))
        self.wait(2)
