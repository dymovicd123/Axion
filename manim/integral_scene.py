from manim import *


class IntegralRectangles(Scene):
    def construct(self):
        self.camera.background_color = '#101c2b'

        title = Text('Integral: adding small amounts', font_size=34).to_edge(UP)
        axes = Axes(
            x_range=[0, 4.5, 1],
            y_range=[0, 6, 1],
            x_length=8.2,
            y_length=4.5,
            tips=False,
            axis_config={'color': GREY_B},
        ).shift(DOWN * 0.2)
        labels = axes.get_axis_labels(
            x_label=Text('time', font_size=24),
            y_label=Text('rate', font_size=24),
        )
        graph = axes.plot(lambda x: 1 + x, x_range=[0, 4], color=BLUE_C)

        count_text = Text('Rectangles:', font_size=24)
        count_value = Text('4', font_size=24, color=TEAL_C)
        count_pair = VGroup(count_text, count_value).arrange(RIGHT, buff=0.15)
        count_pair.to_edge(DOWN).shift(LEFT * 2.1)
        area_text = Text('Estimated total:', font_size=24)
        area_value = Text('10.00', font_size=24, color=TEAL_C)
        area_pair = VGroup(area_text, area_value).arrange(RIGHT, buff=0.15)
        area_pair.to_edge(DOWN).shift(RIGHT * 2.1)

        def get_rectangles(count):
            return axes.get_riemann_rectangles(
                graph,
                x_range=[0, 4],
                dx=4 / count,
                input_sample_type='left',
                fill_opacity=0.6,
                stroke_width=1,
                color=TEAL_C,
            )

        self.play(Write(title), Create(axes), Write(labels), Create(graph), run_time=2)
        rectangles = get_rectangles(4)
        self.play(FadeIn(rectangles), FadeIn(count_text), FadeIn(count_value),
                  FadeIn(area_text), FadeIn(area_value), run_time=1.2)

        for count in [8, 16, 32]:
            more = get_rectangles(count)
            next_count = Text(str(count), font_size=24, color=TEAL_C).move_to(count_value)
            next_area = Text(f'{12 - 8 / count:.2f}', font_size=24, color=TEAL_C).move_to(area_value)
            self.play(
                ReplacementTransform(rectangles, more),
                Transform(count_value, next_count),
                Transform(area_value, next_area),
                run_time=1.4,
            )
            rectangles = more

        conclusion = Text('Exact integral = 12', font_size=25, color=GREEN_C)
        conclusion.next_to(title, DOWN, buff=0.2)
        self.play(FadeIn(conclusion), run_time=0.8)
        self.wait(1.2)
